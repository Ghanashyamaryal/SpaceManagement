import type { Request, Response } from 'express';
import { BranchModel } from '../../models/branch/index.js';

export async function createBranch(req: Request, res: Response): Promise<void> {
  const { name, address, city, phone, email, operatingHours, imageUrl, status } = req.body ?? {};
  if (!name || !address) {
    res.status(400).json({ error: 'name and address required' });
    return;
  }
  const branch = await BranchModel.create({
    name,
    address,
    city,
    phone,
    email,
    operatingHours,
    imageUrl,
    status,
  });
  res.status(201).json({ branch });
}

export async function listBranches(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  if (actor.role === 'superadmin' || actor.role === 'user') {
    const branches = await BranchModel.find().sort({ createdAt: -1 });
    res.json({ branches });
    return;
  }
  if (!actor.branch) {
    res.json({ branches: [] });
    return;
  }
  const branch = await BranchModel.findById(actor.branch);
  res.json({ branches: branch ? [branch] : [] });
}

export async function getBranch(req: Request, res: Response): Promise<void> {
  const branch = await BranchModel.findById(req.params.id);
  if (!branch) {
    res.status(404).json({ error: 'Branch not found' });
    return;
  }
  res.json({ branch });
}

export async function updateBranch(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  if (actor.role === 'admin' && actor.branch !== req.params.id) {
    res.status(403).json({ error: 'Cannot update other branches' });
    return;
  }
  const branch = await BranchModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!branch) {
    res.status(404).json({ error: 'Branch not found' });
    return;
  }
  res.json({ branch });
}

export async function deleteBranch(req: Request, res: Response): Promise<void> {
  const branch = await BranchModel.findByIdAndDelete(req.params.id);
  if (!branch) {
    res.status(404).json({ error: 'Branch not found' });
    return;
  }
  res.status(204).end();
}
