import { z } from 'zod';

export const getImsiCapturesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
  }),
});

export type GetImsiCapturesQueryInput = z.infer<typeof getImsiCapturesQuerySchema>['query'];