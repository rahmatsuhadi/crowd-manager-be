import { Router } from 'express';
import { registerController, loginController } from '../controllers/auth.controller';
import { loginUserSchema } from '../schemas/auth.schema';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createUserSchema } from '../schemas/user.schema';


const router = Router();

// @route   POST /api/auth/login
router.post('/login', validate(loginUserSchema), loginController);


// @route   POST /api/auth/login
router.post('/register', validate(createUserSchema), registerController);


// @route   GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json(req.user);
});

export default router;