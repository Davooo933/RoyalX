import { z } from 'zod';

export const CreateTableSchema = z.object({
  name: z.string().min(3),
  blinds: z.object({ small: z.number().int().positive(), big: z.number().int().positive() }),
  maxSeats: z.number().int().min(2).max(9),
  private: z.boolean().optional(),
  password: z.string().optional()
});

export type CreateTableInput = z.infer<typeof CreateTableSchema>;

import { z } from zod;

export const CreateTableSchema = z.object({
  name: z.string().min(3),
  blinds: z.object({ small: z.number().int().positive(), big: z.number().int().positive() }),
  maxSeats: z.number().int().min(2).max(9),
  private: z.boolean().optional(),
  password: z.string().optional()
});

export type CreateTableInput = z.infer<typeof CreateTableSchema>;
