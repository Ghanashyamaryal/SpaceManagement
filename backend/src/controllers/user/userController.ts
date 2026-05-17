import type { Request, Response } from 'express';
import { UserModel, ROLES, type Role } from '../../models/user/index.js';
import { BranchModel } from '../../models/branch/index.js';
import { hashPassword } from '../../utils/hash.js';

export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email, password, role, branch, phone } = req.body ?? {};
  const actor = req.user!;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'name, email, password, role required' });
    return;
  }

  let targetRole = role as Role;
  let targetBranch: string | null = branch ?? null;

  if (actor.role === 'admin') {
    if (targetRole !== 'user') {
      res.status(403).json({ error: 'Admins can only create users' });
      return;
    }
    targetBranch = actor.branch;
  } else if (actor.role === 'superadmin') {
    if (!ROLES.includes(targetRole)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }
    if (targetRole !== 'superadmin' && !targetBranch) {
      res.status(400).json({ error: 'branch required for admin/user' });
      return;
    }
    if (targetBranch) {
      const b = await BranchModel.findById(targetBranch);
      if (!b) {
        res.status(400).json({ error: 'branch not found' });
        return;
      }
    }
  }

  const existing = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    name,
    email,
    passwordHash,
    role: targetRole,
    branch: targetBranch,
    phone: phone ?? '',
  });

  res.status(201).json({ user });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const filter: Record<string, unknown> = {};
  if (actor.role === 'admin') filter.branch = actor.branch;
  if (req.query.role) filter.role = req.query.role;

  const users = await UserModel.find(filter).populate('branch').sort({ createdAt: -1 });
  res.json({ users });
}

export async function listMembers(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const filter: Record<string, unknown> = { role: 'user' };
  if (actor.role === 'admin') filter.branch = actor.branch;

  const members = await UserModel.find(filter).populate('branch').sort({ createdAt: -1 });
  res.json({ members });
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const user = await UserModel.findById(req.params.id).populate('branch');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (actor.role === 'admin' && user.branch?._id.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot view user outside your branch' });
    return;
  }
  res.json({ user });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const target = await UserModel.findById(req.params.id);
  if (!target) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { name, phone, isActive, role, branch } = req.body ?? {};
  const isSelf = target._id.toString() === actor.sub;

  if (actor.role === 'admin' && !isSelf && target.branch?.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot update user outside your branch' });
    return;
  }

  if (name != null) target.name = name;
  if (phone != null) target.phone = phone;

  if (isActive != null) {
    if (actor.role === 'user') {
      res.status(403).json({ error: 'Cannot change isActive' });
      return;
    }
    target.isActive = !!isActive;
  }

  if (role != null) {
    if (actor.role !== 'superadmin') {
      res.status(403).json({ error: 'Only superadmin can change roles' });
      return;
    }
    if (!ROLES.includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }
    if (target.role === 'superadmin' && role !== 'superadmin') {
      const otherSuperadmins = await UserModel.countDocuments({
        role: 'superadmin',
        _id: { $ne: target._id },
      });
      if (otherSuperadmins === 0) {
        res.status(400).json({ error: 'Cannot demote the last superadmin' });
        return;
      }
    }
    target.role = role;
    if (role === 'superadmin') target.branch = null;
  }

  if (branch !== undefined) {
    if (actor.role !== 'superadmin') {
      res.status(403).json({ error: 'Only superadmin can change branch assignment' });
      return;
    }
    if (target.role === 'superadmin' && branch != null) {
      res.status(400).json({ error: 'Superadmin cannot be assigned to a branch' });
      return;
    }
    if (branch) {
      const b = await BranchModel.findById(branch);
      if (!b) {
        res.status(400).json({ error: 'branch not found' });
        return;
      }
    }
    target.branch = branch;
  }

  await target.save();
  res.json({ user: target });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const target = await UserModel.findById(req.params.id);

  if (!target) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (target._id.toString() === actor.sub) {
    res.status(400).json({ error: 'Cannot delete yourself' });
    return;
  }
  if (target.role === 'superadmin') {
    const otherSuperadmins = await UserModel.countDocuments({
      role: 'superadmin',
      _id: { $ne: target._id },
    });
    if (otherSuperadmins === 0) {
      res.status(400).json({ error: 'Cannot delete the last superadmin' });
      return;
    }
  }
  if (actor.role === 'admin' && target.branch?.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot delete user outside your branch' });
    return;
  }

  await target.deleteOne();
  res.status(204).end();
}
