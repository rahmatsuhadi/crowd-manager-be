import { Router } from 'express';
import {
  createDeviceController,
  deleteDeviceController,
  getAllDevicesController,
  getDeviceOverviewController,
  updateDeviceStatusController,
} from '../controllers/device.controller';
import { createDeviceSchema, updateDeviceStatusSchema } from '../schemas/device.schema';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createDeviceSchema), createDeviceController);
router.get('/', getAllDevicesController);

router.delete('/:id', deleteDeviceController);
router.get('/overview', getDeviceOverviewController);

// Route for turning a device ON/OFF (updating its status)
router.patch('/:id/status', validate(updateDeviceStatusSchema), updateDeviceStatusController);


export default router;