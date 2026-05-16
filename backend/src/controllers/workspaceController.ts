import type { Request, Response } from 'express';
import { WorkspaceModel } from '../models/Workspace.js';
import { BranchModel } from '../models/Branch.js';

export async function createWorkspace(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const body = req.body ?? {};
  const branchId = actor.role === 'admin' ? actor.branch : body.branch;

  if (!body.name || !branchId || !body.capacity) {
    res.status(400).json({ error: 'name, branch, capacity required' });
    return;
  }

  const branch = await BranchModel.findById(branchId);
  if (!branch) {
    res.status(400).json({ error: 'branch not found' });
    return;
  }

  const workspace = await WorkspaceModel.create({ ...body, branch: branchId });
  res.status(201).json({ workspace });
}

export async function listWorkspaces(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const filter: Record<string, unknown> = {};

  if (actor.role === 'admin') {
    filter.branch = actor.branch;
  } else if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;

  const workspaces = await WorkspaceModel.find(filter)
    .populate('branch')
    .sort({ createdAt: -1 });
  res.json({ workspaces });
}

export async function getWorkspace(req: Request, res: Response): Promise<void> {
  const workspace = await WorkspaceModel.findById(req.params.id).populate('branch');
  if (!workspace) {
    res.status(404).json({ error: 'Workspace not found' });
    return;
  }
  res.json({ workspace });
}

export async function updateWorkspace(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const workspace = await WorkspaceModel.findById(req.params.id);
  if (!workspace) {
    res.status(404).json({ error: 'Workspace not found' });
    return;
  }
  if (actor.role === 'admin' && workspace.branch.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot update workspace outside your branch' });
    return;
  }

  const { branch: _branch, ...updates } = req.body ?? {};
  Object.assign(workspace, updates);
  await workspace.save();
  res.json({ workspace });
}

export async function deleteWorkspace(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const workspace = await WorkspaceModel.findById(req.params.id);
  if (!workspace) {
    res.status(404).json({ error: 'Workspace not found' });
    return;
  }
  if (actor.role === 'admin' && workspace.branch.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot delete workspace outside your branch' });
    return;
  }
  await workspace.deleteOne();
  res.status(204).end();
}
