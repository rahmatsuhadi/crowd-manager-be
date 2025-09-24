import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { LoginUserInput, RegisterUserInput } from '../schemas/auth.schema';
import { CreateUserInput } from '../schemas/user.schema';
import * as userService from '../services/user.service';
import { Prisma } from '@prisma/client';

export async function loginController(
    req: Request<{}, {}, LoginUserInput>,
    res: Response,
    next: NextFunction
) {
    try {
        const token = await authService.loginUser(req.body);

        res.status(200).json({
            status: 'success',
            token,
        });
    } catch (error: any) {
        if (error.message.includes('Invalid email or password')) {
            return res.status(401).json({ status: 'error', message: error.message });
        }
        next(error);
    }
}



export async function registerController(
    req: Request<{}, {}, RegisterUserInput>,
    res: Response,
    next: NextFunction
) {
    try {
        const user = await userService.createUser({
            ...req.body,
            role: "VIEWER"
        });
        res.status(201).json({
            status: 'success',
            data: { user },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(409).json({ status: 'fail', message: error.message });
        }
        next(error);
    }
}
