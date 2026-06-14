import type { Request, Response } from 'express';
import { MenuItemModel } from '../../models/canteen/index.js';
import { BranchModel } from '../../models/branch/index.js';

export async function createMenuItem(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { name, branch, category, price, prepTimeMinutes, description, imageUrl, isAvailable } =
    req.body ?? {};

  if (!name || !category || price == null) {
    res.status(400).json({ error: 'name, category, price required' });
    return;
  }

  const branchId = branch ?? actor.branch;
  if (!branchId) {
    res.status(400).json({ error: 'branch required' });
    return;
  }

  const branchDoc = await BranchModel.findById(branchId);
  if (!branchDoc) {
    res.status(400).json({ error: 'branch not found' });
    return;
  }
  if (actor.role === 'admin' && branchDoc._id.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot create item outside your branch' });
    return;
  }

  const item = await MenuItemModel.create({
    name,
    branch: branchDoc._id,
    category,
    price,
    prepTimeMinutes: prepTimeMinutes ?? 0,
    description: description ?? '',
    imageUrl: imageUrl ?? '',
    isAvailable: isAvailable ?? true,
  });
  res.status(201).json({ menuItem: item });
}

export async function listMenuItems(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const filter: Record<string, unknown> = {};

  if (actor.role === 'admin') {
    filter.branch = actor.branch;
  } else if (actor.role === 'user') {
    filter.isAvailable = true;
    if (req.query.branch) filter.branch = req.query.branch;
  }
  if (req.query.category) filter.category = req.query.category;

  const items = await MenuItemModel.find(filter)
    .populate('branch', 'name')
    .sort({ category: 1, name: 1 });
  res.json({ menuItems: items });
}

export async function getMenuItem(req: Request, res: Response): Promise<void> {
  const item = await MenuItemModel.findById(req.params.id).populate('branch', 'name');
  if (!item) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }
  res.json({ menuItem: item });
}

export async function updateMenuItem(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const item = await MenuItemModel.findById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }
  if (actor.role === 'admin' && item.branch.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot update item outside your branch' });
    return;
  }

  const { name, category, price, prepTimeMinutes, description, imageUrl, isAvailable } =
    req.body ?? {};
  if (name !== undefined) item.name = name;
  if (category !== undefined) item.category = category;
  if (price !== undefined) item.price = price;
  if (prepTimeMinutes !== undefined) item.prepTimeMinutes = prepTimeMinutes;
  if (description !== undefined) item.description = description;
  if (imageUrl !== undefined) item.imageUrl = imageUrl;
  if (isAvailable !== undefined) item.isAvailable = isAvailable;
  await item.save();
  res.json({ menuItem: item });
}

export async function deleteMenuItem(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const item = await MenuItemModel.findById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }
  if (actor.role === 'admin' && item.branch.toString() !== actor.branch) {
    res.status(403).json({ error: 'Cannot delete item outside your branch' });
    return;
  }
  await item.deleteOne();
  res.status(204).end();
}
