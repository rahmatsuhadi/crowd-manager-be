import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user && user.role === 'ADMIN') {
    return next();
  }

  return res.status(403).json({
    status: 'fail',
    message: 'Forbidden: You do not have permission to perform this action.',
  });
};