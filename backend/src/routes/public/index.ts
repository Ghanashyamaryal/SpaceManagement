import { Router } from 'express';
import { BranchModel } from '../../models/branch/index.js';
import { WorkspaceModel } from '../../models/workspace/index.js';
import { PlanModel } from '../../models/plan/index.js';
import { EventModel } from '../../models/event/index.js';

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

router.get('/events', async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.branch_id) filter.branch_id = req.query.branch_id;
  if (req.query.event_type) filter.event_type = req.query.event_type;
  if (req.query.status) filter.status = req.query.status;
  else filter.status = { $in: ['upcoming', 'ongoing'] };

  const events = await EventModel.find(filter)
    .populate('branch_id', 'name city')
    .sort({ date: 1 });
  res.json({ events });
});

router.get('/events/:id', async (req, res) => {
  const event = await EventModel.findById(req.params.id).populate('branch_id', 'name city');
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  res.json({ event });
});

export default router;
