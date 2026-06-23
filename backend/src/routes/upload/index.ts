import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../../controllers/upload/index.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';

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

// Any authenticated user can upload their own avatar (forced to the avatars folder).
router.post(
  '/avatar',
  upload.single('image'),
  (req, _res, next) => {
    req.body = { ...req.body, folder: 'avatars' };
    next();
  },
  uploadImage
);

export default router;
