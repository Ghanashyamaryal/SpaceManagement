import type { Request, Response } from 'express';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';

const ALLOWED_FOLDERS = new Set(['branches', 'workspaces', 'avatars']);

export async function uploadImage(req: Request, res: Response): Promise<void> {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    res.status(500).json({ error: 'Cloudinary not configured on server' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'file required (multipart field name: image)' });
    return;
  }

  const folder = (req.body?.folder as string | undefined) ?? 'misc';
  const safeFolder = ALLOWED_FOLDERS.has(folder) ? folder : 'misc';

  try {
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `cowork/${safeFolder}`,
      resource_type: 'image',
    });
    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
}
