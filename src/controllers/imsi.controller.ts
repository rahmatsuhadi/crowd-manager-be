import { Request, Response, NextFunction } from 'express';
import * as imsiService from '../services/imsi.service';
import { GetImsiCapturesQueryInput } from '../schemas/imsi.schema';

export async function getAllImsiCapturesController(
  req: Request<{}, {}, {}, GetImsiCapturesQueryInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const result = await imsiService.getAllImsiCaptures(req.query, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}


export async function importFileController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded.' });
    }

    const userId = req.user!.id;
    const count = await imsiService.importIMSIFromFile(req.file.path, req.file.mimetype, userId);

    res.status(201).json({
      status: 'success',
      message: `${count} records were successfully imported.`,
    });
  } catch (error) {
    next(error);
  }
}