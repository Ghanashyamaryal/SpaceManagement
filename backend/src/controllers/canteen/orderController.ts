import type { Request, Response } from 'express';
import {
  CanteenOrderModel,
  CANTEEN_ORDER_STATUSES,
  type CanteenOrderStatus,
  CreditTransactionModel,
  MenuItemModel,
} from '../../models/canteen/index.js';

interface IncomingItem {
  menuItemId?: string;
  quantity?: number;
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { items } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'items required (non-empty array)' });
    return;
  }

  const ids = (items as IncomingItem[]).map((i) => i.menuItemId).filter(Boolean) as string[];
  if (ids.length !== items.length) {
    res.status(400).json({ error: 'every item must have menuItemId' });
    return;
  }

  const menuItems = await MenuItemModel.find({ _id: { $in: ids } });
  if (menuItems.length !== ids.length) {
    res.status(400).json({ error: 'one or more menu items not found' });
    return;
  }

  const byId = new Map(menuItems.map((m) => [m._id.toString(), m]));
  const branches = new Set(menuItems.map((m) => m.branch.toString()));
  if (branches.size > 1) {
    res.status(400).json({ error: 'all items must belong to the same branch' });
    return;
  }
  const branchId = [...branches][0];

  const orderItems: {
    menuItem: typeof menuItems[number]['_id'];
    name: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[] = [];
  let totalAmount = 0;
  for (const incoming of items as IncomingItem[]) {
    const menuItem = byId.get(String(incoming.menuItemId));
    const quantity = Number(incoming.quantity);
    if (!menuItem) {
      res.status(400).json({ error: 'menu item missing' });
      return;
    }
    if (!menuItem.isAvailable) {
      res.status(400).json({ error: `${menuItem.name} is not available` });
      return;
    }
    if (!quantity || quantity < 1) {
      res.status(400).json({ error: 'quantity must be at least 1' });
      return;
    }
    const subtotal = menuItem.price * quantity;
    totalAmount += subtotal;
    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      unitPrice: menuItem.price,
      quantity,
      subtotal,
    });
  }

  const order = await CanteenOrderModel.create({
    user: actor.sub,
    branch: branchId,
    items: orderItems,
    totalAmount,
    status: 'requested',
  });
  res.status(201).json({ order });
}

export async function listOrders(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const filter: Record<string, unknown> = {};

  if (actor.role === 'user') {
    filter.user = actor.sub;
  } else if (actor.role === 'admin') {
    filter.branch = actor.branch;
  }
  if (req.query.status) filter.status = req.query.status;

  const orders = await CanteenOrderModel.find(filter)
    .populate('user', 'name email')
    .populate('branch', 'name')
    .sort({ createdAt: -1 });
  res.json({ orders });
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const order = await CanteenOrderModel.findById(req.params.id)
    .populate('user', 'name email')
    .populate('branch', 'name');
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (actor.role === 'user' && order.user._id.toString() !== actor.sub) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (actor.role === 'admin' && order.branch._id.toString() !== actor.branch) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  res.json({ order });
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { status, rejectionReason } = req.body ?? {};

  if (!status || !CANTEEN_ORDER_STATUSES.includes(status as CanteenOrderStatus)) {
    res.status(400).json({ error: `status must be one of ${CANTEEN_ORDER_STATUSES.join(', ')}` });
    return;
  }

  const order = await CanteenOrderModel.findById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (actor.role === 'admin' && order.branch.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot update order outside your branch' });
    return;
  }

  const current = order.status as CanteenOrderStatus;
  const next = status as CanteenOrderStatus;
  const valid =
    (current === 'requested' && (next === 'accepted' || next === 'rejected')) ||
    (current === 'accepted' && next === 'delivered');
  if (!valid) {
    res.status(400).json({ error: `Invalid transition: ${current} → ${next}` });
    return;
  }

  if (next === 'accepted') {
    order.acceptedAt = new Date();
    await CreditTransactionModel.create({
      user: order.user,
      type: 'order_charge',
      amount: order.totalAmount,
      order: order._id,
      createdBy: actor.sub,
    });
  } else if (next === 'rejected') {
    order.rejectionReason = rejectionReason ?? '';
  } else if (next === 'delivered') {
    order.deliveredAt = new Date();
  }
  order.status = next;
  await order.save();
  res.json({ order });
}

export async function cancelOrder(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const order = await CanteenOrderModel.findById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (actor.role === 'user' && order.user.toString() !== actor.sub) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (actor.role === 'admin' && order.branch.toString() !== actor.branch) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (order.status !== 'requested') {
    res.status(400).json({ error: 'Only pending orders can be cancelled' });
    return;
  }
  await order.deleteOne();
  res.status(204).end();
}
