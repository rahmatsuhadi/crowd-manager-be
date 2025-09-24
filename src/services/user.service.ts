import { Prisma, PrismaClient, Role, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ChangeUserPasswordInput, CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

const prisma = new PrismaClient();

export async function getUserOverviewStats() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // 5 menit
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const [
    totalUsers,
    usersCreatedLastWeek,
    activeUsers,
    adminCount,
    operatorCount,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.user.count({ where: { lastActive: { gte: fiveMinutesAgo } } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { role: Role.OPERATOR } }),
  ]);

  return {
    totalUsers,
    totalUsersChange: usersCreatedLastWeek, // This represents the "+2 from last week" value
    activeUsers,
    adminCount,
    operatorCount,
  };
}

export async function createUser(
  input: CreateUserInput
): Promise<Omit<User, 'password'>> {
  const { email, name, password, role } = input;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getAllUsers(query: { page: number; limit: number; search?: string }) {
  const { page, limit, search } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = search
    ? {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive', // Pencarian case-insensitive
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    }
    : {};

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        lastLogin: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);

  const fiveMinutesInMs = 5 * 60 * 1000;
  const now = new Date();

  const userresult = users.map(user => {
    let activeStatus = 'Inctive'; // Default status adalah Inctive

    // Jika user pernah aktif dan waktu terakhir aktifnya kurang dari 5 menit yang lalu
    if (user.lastActive && (now.getTime() - user.lastActive.getTime()) < fiveMinutesInMs) {
      activeStatus = 'Active';
    }

    return {
      ...user,
      activeStatus,
    };
  });

  return {
    data: userresult,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUserById(id: string): Promise<Omit<User, 'password'> | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      lastLogin: true,
      lastActive: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return user;
}

export async function changePassword(
  id: string,
  input: ChangeUserPasswordInput
): Promise<Omit<User, 'password'>> {
  const { passwordConfirmation, ...body } = input

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.update({
    where: { id },
    data: { ...body, password: hashedPassword },
  });

  return user;

}

export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<Omit<User, 'password'>> {

  const { name, role } = input


  const user = await prisma.user.update({
    where: { id },
    data: {
      name, role
    }
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
}