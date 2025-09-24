
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { NextFunction, Request, Response } from 'express';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Access denied: No token provided.');
      return res.status(401).json({
        status: 'fail',
        message: 'Access denied. Please log in first.',
      });
    }

    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET || 'secret';

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      logger.warn({ userId: decoded.userId }, 'Authentication failed: User not found.');
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token or your session has expired.',
      });
    }

    req.user = user;
    const now = new Date();
    const fiveMinutesInMs = 5 * 60 * 1000;

    if (!user.lastActive || (now.getTime() - user.lastActive.getTime()) > fiveMinutesInMs) {
      
      prisma.user.update({
        where: { id: user.id },
        data: { lastActive: now },
      }).catch(err => logger.error(err, 'Failed to update lastActive timestamp'));
    }
    logger.info({ userId: user.id }, 'User authenticated.');
    next();

  } catch (error) {
    logger.error(error, 'Error during token verification.');

    if (error instanceof JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Your token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.',
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
    });
  }
};