import { Router } from 'express';
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  getUserOverviewController,
  changePasswordUserController,
} from '../controllers/user.controller';
import { changePasswordUserSchema, createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { validate } from '../middlewares/validate.middleware';
import { isAdmin } from '../middlewares/authorize.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Terapkan admin
router.use(authMiddleware, isAdmin);

router.get('/', getAllUsersController);

router.get('/overview', getUserOverviewController);

router.post('/', validate(createUserSchema), createUserController);

router.get('/:id', getUserByIdController);

router.patch('/:id', validate(updateUserSchema), updateUserController);

router.patch('/:id/change-password', validate(changePasswordUserSchema), changePasswordUserController);

router.delete('/:id', deleteUserController);

export default router;