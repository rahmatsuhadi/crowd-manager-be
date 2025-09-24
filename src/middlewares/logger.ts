import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    console.log(
      `[${timestamp}] ${method} ${originalUrl} | Status: ${statusCode} | Durasi: ${duration}ms`
    );
  });

  // Jangan lupa panggil next() agar request diteruskan ke handler selanjutnya
  next();
};