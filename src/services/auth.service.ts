import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginUserInput } from '../schemas/auth.schema';

const prisma = new PrismaClient();

export async function loginUser(input: LoginUserInput): Promise<string> {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    const expiresInSeconds = 24 * 60 * 60; // 86400 detik

    const JWT_SECRET = process.env.JWT_SECRET || 'secret';

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: expiresInSeconds }
    );

    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });

    return token;
}