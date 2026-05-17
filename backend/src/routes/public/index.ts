import { Router } from 'express';
import { BranchModel } from '../../models/branch/index.js';
import { WorkspaceModel } from '../../models/workspace/index.js';
import { PlanModel } from '../../models/plan/index.js';

const router = Router();

router.get('/branches', async (_req, res) => {
  const branches = await BranchModel.find().sort({ createdAt: -1 });
  res.json({ branches });
});

router.get('/branches/:id', async (req, res) => {
  const branch = await BranchModel.findById(req.params.id);
  if (!branch) {
    res.status(404).json({ error: 'Branch not found' });
    return;
  }
  res.json({ branch });
});

router.get('/workspaces', async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.branch) filter.branch = req.query.branch;
  if (req.query.type) filter.type = req.query.type;

  const workspaces = await WorkspaceModel.find(filter)
    .populate('branch', 'name city')
    .sort({ createdAt: -1 });
  res.json({ workspaces });
});

router.get('/plans', async (_req, res) => {
  const plans = await PlanModel.find({ isActive: true }).sort({ price: 1 });
  res.json({ plans });
});

export default router;
