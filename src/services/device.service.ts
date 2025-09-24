import { PrismaClient, Device, Prisma, DeviceStatus } from '@prisma/client';
import { CreateDeviceInput, UpdateDeviceStatusInput } from '../schemas/device.schema';

const prisma = new PrismaClient();

async function findDeviceById(deviceId: string, userId: string): Promise<Device | null> {
  return prisma.device.findFirst({
    where: {
      id: deviceId,
      userId: userId,
    },
  });
}

export async function createDevice(input: CreateDeviceInput, userId: string): Promise<Device> {
  return prisma.device.create({
    data: { ...input, userId },
  });
}

export async function deleteDevice(deviceId: string, userId: string): Promise<Device | null> {
  const device = await findDeviceById(deviceId, userId);
  if (!device) return null; // Not found or no permission

  return prisma.device.delete({
    where: { id: deviceId },
  });
}


export async function updateDeviceStatus(
  deviceId: string,
  userId: string,
  input: UpdateDeviceStatusInput
): Promise<Device | null> {
  const device = await findDeviceById(deviceId, userId);
  if (!device) return null; // Not found or no permission

  return prisma.device.update({
    where: { id: deviceId },
    data: { status: input.status },
  });
}


export async function getAllDevices(
  query: { page: number; limit: number; search?: string },
  userId: string
) {
  const { page, limit, search } = query;
  const skip = (page - 1) * limit;

  const baseWhere: Prisma.DeviceWhereInput = { userId };

  const searchWhere: Prisma.DeviceWhereInput | null = search
    ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { osVersion: { contains: search, mode: 'insensitive' } },
      ],
    }
    : null;

  const where: Prisma.DeviceWhereInput = searchWhere
    ? { AND: [baseWhere, searchWhere] }
    : baseWhere;

  const [devices, total] = await prisma.$transaction([
    prisma.device.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.device.count({ where }),
  ]);

  return {
    data:devices,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getDeviceOverviewStats(userId: string) {
  // Use Prisma's $transaction to run all count queries concurrently for better performance
  const [
    totalDevices,
    onlineDevices,
    offlineDevices,
    warningDevices,
  ] = await prisma.$transaction([
    prisma.device.count({ where: { userId } }),
    prisma.device.count({ where: { userId, status: DeviceStatus.ONLINE } }),
    prisma.device.count({ where: { userId, status: DeviceStatus.OFFLINE } }),
    prisma.device.count({ where: { userId, status: DeviceStatus.WARNING } }),
  ]);

  return {
    totalDevices,
    onlineDevices,
    offlineDevices,
    warningDevices,
  };
}