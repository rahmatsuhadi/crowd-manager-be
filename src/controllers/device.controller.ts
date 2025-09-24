import { Request, Response, NextFunction } from 'express';
import * as deviceService from '../services/device.service';
import { CreateDeviceInput, GetDevicesQueryInput, UpdateDeviceStatusInput } from '../schemas/device.schema';

export async function createDeviceController(
    req: Request<{}, {}, CreateDeviceInput>,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;
        const device = await deviceService.createDevice(req.body, userId);
        res.status(201).json({
            status: 'success',
            data:device,
        });
    } catch (error) {
        next(error);
    }
}


export async function getAllDevicesController(
  req: Request<{}, {}, {}, GetDevicesQueryInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const search = req.query.search;

    const result = await deviceService.getAllDevices({ page, limit, search }, userId);

    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDeviceController(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const device = await deviceService.deleteDevice(req.params.id, userId);
        if (!device) {
            return res.status(404).json({ status: 'fail', message: 'Device not found or you do not have permission to delete it' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function updateDeviceStatusController(
    req: Request<{ id: string }, {}, UpdateDeviceStatusInput>,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.id;
        const device = await deviceService.updateDeviceStatus(req.params.id, userId, req.body);
        if (!device) {
            return res.status(404).json({ status: 'fail', message: 'Device not found or you do not have permission to edit it' });
        }
        res.status(200).json({
            status: 'success',
            data: { device },
        });
    } catch (error) {
        next(error);
    }
}

export async function getDeviceOverviewController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const stats = await deviceService.getDeviceOverviewStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}