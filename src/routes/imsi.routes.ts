import { Router } from 'express';
import multer from 'multer';
import { getImsiCapturesQuerySchema } from '../schemas/imsi.schema';
import { getAllImsiCapturesController, importFileController } from '../controllers/imsi.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Configure temporary upload directory

// Apply auth middleware to all IMSI routes
router.use(authMiddleware);

// @route   GET /api/imsi
router.get('/', validate(getImsiCapturesQuerySchema), getAllImsiCapturesController);

// @route   POST /api/imsi/import
router.post(
  '/import', 
  upload.single('file'), 
  importFileController
);

export default router;