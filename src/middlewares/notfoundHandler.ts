import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `Route not found: ${req.method} ${req.originalUrl}`;

  res.status(404).json({
    status: 'error',
    message,
  });
};