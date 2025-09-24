import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod'; // <-- Impor 'z' bukan 'AnyZodObject'

export const validate = (schema: z.Schema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.method != "GET" && (!req.body || Object.keys(req.body).length === 0)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Request body cannot be empty and must be in JSON format.',
        });
      }
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });


      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'validation errro',
          errors: error.issues.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };