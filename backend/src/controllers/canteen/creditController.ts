import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CreditTransactionModel } from '../../models/canteen/index.js';
import { UserModel } from '../../models/user/index.js';

async function computeBalance(userId: string): Promise<{
  balance: number;
  charges: number;
  settlements: number;
}> {
  const result = await CreditTransactionModel.aggregate<{
    _id: 'order_charge' | 'settlement';
    total: number;
  }>([
    { $match: { user: new Types.ObjectId(userId) } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  let charges = 0;
  let settlements = 0;
  for (const row of result) {
    if (row._id === 'order_charge') charges = row.total;
    if (row._id === 'settlement') settlements = row.total;
  }
  return { balance: charges - settlements, charges, settlements };
}

export async function getMyBalance(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const summary = await computeBalance(actor.sub);
  const recentTransactions = await CreditTransactionModel.find({ user: actor.sub })
    .populate('order', 'totalAmount items')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ ...summary, recentTransactions });
}

export async function listUserBalances(_req: Request, res: Response): Promise<void> {
  const users = await UserModel.find({ role: 'user' }).select('name email');

  const balances = await Promise.all(
    users.map(async (u) => {
      const summary = await computeBalance(u._id.toString());
      return {
        user: { _id: u._id, name: u.name, email: u.email },
        ...summary,
      };
    })
  );

  const outstanding = balances.filter((b) => b.balance > 0);
  res.json({ balances: outstanding });
}

export async function getUserBalance(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const user = await UserModel.findById(id).select('name email');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const summary = await computeBalance(id);
  const recentTransactions = await CreditTransactionModel.find({ user: id })
    .populate('order', 'totalAmount items')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ user, ...summary, recentTransactions });
}

export async function settleBalance(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { userId, amount, note } = req.body ?? {};

  if (!userId) {
    res.status(400).json({ error: 'userId required' });
    return;
  }
  const user = await UserModel.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const current = await computeBalance(userId);
  if (current.balance <= 0) {
    res.status(400).json({ error: 'User has no outstanding balance' });
    return;
  }

  let settleAmount = amount != null ? Number(amount) : current.balance;
  if (!Number.isFinite(settleAmount) || settleAmount <= 0) {
    res.status(400).json({ error: 'amount must be positive' });
    return;
  }
  if (settleAmount > current.balance) settleAmount = current.balance;

  await CreditTransactionModel.create({
    user: userId,
    type: 'settlement',
    amount: settleAmount,
    note: note ?? '',
    createdBy: actor.sub,
  });

  const updated = await computeBalance(userId);
  res.json({ message: 'Settled', settled: settleAmount, ...updated });
}
