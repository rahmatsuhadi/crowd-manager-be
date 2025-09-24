import { z } from 'zod';

export const loginUserSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),

    password: z.string({
      error: 'Password is required',
    }),
  }),
});


export const registerUserSchema = z.object({
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
    passwordConfirmation: z
      .string({
        error: 'Password confirmation is required',
      }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password and password confirmation do not match',
    path: ['passwordConfirmation'],
  }).strict()
});


export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];