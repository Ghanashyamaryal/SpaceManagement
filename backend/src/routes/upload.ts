import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  },
});

router.use(requireAuth);

router.post(
  '/image',
  requireRole('superadmin', 'admin'),
  upload.single('image'),
  uploadImage
);

export default router;
