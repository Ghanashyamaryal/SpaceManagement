import type { Request, Response } from 'express';
import { PlanModel } from '../../models/plan/index.js';

export async function createPlan(req: Request, res: Response): Promise<void> {
  const { name, type, price, durationDays } = req.body ?? {};
  if (!name || !type || price == null || !durationDays) {
    res.status(400).json({ error: 'name, type, price, durationDays required' });
    return;
  }
  const plan = await PlanModel.create(req.body);
  res.status(201).json({ plan });
}

export async function listPlans(_req: Request, res: Response): Promise<void> {
  const plans = await PlanModel.find().sort({ createdAt: -1 });
  res.json({ plans });
}

export async function getPlan(req: Request, res: Response): Promise<void> {
  const plan = await PlanModel.findById(req.params.id);
  if (!plan) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }
  res.json({ plan });
}

export async function updatePlan(req: Request, res: Response): Promise<void> {
  const plan = await PlanModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }
  res.json({ plan });
}

export async function deletePlan(req: Request, res: Response): Promise<void> {
  const plan = await PlanModel.findByIdAndDelete(req.params.id);
  if (!plan) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }
  res.status(204).end();
}
