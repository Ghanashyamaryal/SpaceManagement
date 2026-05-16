import type { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { generateResetToken, hashResetToken } from '../utils/resetToken.js';

const PASSWORD_MIN = 8;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function signup(req: Request, res: Response): Promise<void> {
  const { name, email, password, phone } = req.body ?? {};
  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email, password required' });
    return;
  }
  if (String(password).length < PASSWORD_MIN) {
    res.status(400).json({ error: `password must be at least ${PASSWORD_MIN} characters` });
    return;
  }

  const normalizedEmail = String(email).toLowerCase();
  const existing = await UserModel.findOne({ email: normalizedEmail });
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'user',
    branch: null,
    phone: phone ?? '',
  });

  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
    branch: null,
  });

  res.status(201).json({ token, user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: 'email and password required' });
    return;
  }

  const user = await UserModel.findOne({ email: String(email).toLowerCase() });
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
    branch: user.branch ? user.branch.toString() : null,
  });

  res.json({ token, user });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await UserModel.findById(req.user!.sub).populate('branch');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body ?? {};
  if (!email) {
    res.status(400).json({ error: 'email required' });
    return;
  }

  const user = await UserModel.findOne({ email: String(email).toLowerCase() });
  // Always 200 to avoid leaking which emails exist.
  if (!user || !user.isActive) {
    res.json({ message: 'If that email exists, a reset link has been sent.' });
    return;
  }

  const { token, tokenHash } = generateResetToken();
  user.set('passwordResetTokenHash', tokenHash);
  user.set('passwordResetExpires', new Date(Date.now() + RESET_TOKEN_TTL_MS));
  await user.save();

  // Dev: log the link. Swap for nodemailer in production.
  console.log(`[password-reset] ${user.email} → token=${token} (expires in 1h)`);

  const payload: Record<string, unknown> = {
    message: 'If that email exists, a reset link has been sent.',
  };
  if (process.env.NODE_ENV !== 'production') {
    payload.devToken = token;
  }
  res.json(payload);
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body ?? {};
  if (!token || !password) {
    res.status(400).json({ error: 'token and password required' });
    return;
  }
  if (String(password).length < PASSWORD_MIN) {
    res.status(400).json({ error: `password must be at least ${PASSWORD_MIN} characters` });
    return;
  }

  const tokenHash = hashResetToken(String(token));
  const user = await UserModel.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) {
    res.status(400).json({ error: 'Invalid or expired reset token' });
    return;
  }

  user.passwordHash = await hashPassword(password);
  user.set('passwordResetTokenHash', null);
  user.set('passwordResetExpires', null);
  await user.save();

  res.json({ message: 'Password updated. You can now log in.' });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'currentPassword and newPassword required' });
    return;
  }
  if (String(newPassword).length < PASSWORD_MIN) {
    res.status(400).json({ error: `password must be at least ${PASSWORD_MIN} characters` });
    return;
  }

  const user = await UserModel.findById(req.user!.sub);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  res.json({ message: 'Password updated.' });
}
