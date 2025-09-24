
import { z } from 'zod';

// params

export const getUsersQuerySchema = z.object({
    query: z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('10'),
        search: z.string().optional(),
    }),
});

export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>['query'];

// 

export const createUserSchema = z.object({
    body: z.object({
        name: z
            .string({
                error: 'Name is required',
            })
            .min(3, 'Name must be at least 3 characters long'),

        email: z.email('Invalid email format'),
        password: z
            .string({
                error: 'Password is required',
            })
            .min(6, 'Password must be at least 6 characters long'),
        role: z
            .enum(['ADMIN', 'OPERATOR', 'VIEWER'], {
                error: 'Role must be one of the following: ADMIN, OPERATOR, VIEWER',
            }),
        passwordConfirmation: z
            .string({
                error: 'Password confirmation is required',
            }),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: 'Password and password confirmation do not match',
        path: ['passwordConfirmation'],
    }).strict()
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];


export const loginUserSchema = z.object({
    body: z.object({
        email: z.email('Invalid email format'),

        password: z
            .string({
                error: 'Password is required',
            })
            .min(6, 'Password must be at least 6 characters long'),
    }),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];


export const updateUserSchema = z.object({
    body: z.object({
        name: z
            .string({
                error: 'Name is required',
            })
            .min(3, 'Name must be at least 3 characters long').optional(),
        role: z
            .enum(['ADMIN', 'OPERATOR', 'VIEWER'], {
                error: 'Role must be one of the following: ADMIN, OPERATOR, VIEWER',
            })
            .optional(),
    })
});


export const changePasswordUserSchema = z.object({
    body: z.object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
        passwordConfirmation: z.string().min(6, 'Confirm password must be at least 6 characters'),

    }).refine(data => {
        if (data.password) {
            return data.password === data.passwordConfirmation;
        }
        return true;
    }, {
        message: 'Password and confirm password must match',
        path: ['passwordConfirmation'],
    }),
});

export type ChangeUserPasswordInput = z.infer<typeof changePasswordUserSchema>['body'];

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];