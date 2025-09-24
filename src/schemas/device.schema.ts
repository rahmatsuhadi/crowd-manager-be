import { z } from 'zod';

export const createDeviceSchema = z.object({
    body: z.object({
        name: z.string({
            error: 'Device name is required',
        }),
        type: z.enum(["ANDROID", "IOS", "GATEWAY"]),
        osVersion: z.string().optional(),
        location: z.string().optional(),
        whatsappNumber: z.string().optional(),
    }),
});

export const updateDeviceStatusSchema = z.object({
    body: z.object({
        status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'WARNING'], {
            error: 'Status is required',
        }),
    }),
});

export const getDevicesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
  }),
});

export type GetDevicesQueryInput = z.infer<typeof getDevicesQuerySchema>['query'];

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>['body'];
export type UpdateDeviceStatusInput = z.infer<typeof updateDeviceStatusSchema>['body'];