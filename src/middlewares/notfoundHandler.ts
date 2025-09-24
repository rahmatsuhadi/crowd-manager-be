import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `Route tidak ditemukan: ${req.method} ${req.originalUrl}`;

  res.status(404).json({
    status: 'fail',
    message,
  });
};