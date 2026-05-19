import { z } from 'zod';

export const createRideGroupSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  departureTime: z.string().min(1, 'La date de départ est requise'),
  creatorId: z.coerce.number().int().positive(),
  startStationId: z.coerce.number().int().positive(),
  endStationId: z.coerce.number().int().positive(),
});

export type CreateRideGroupInput = z.infer<typeof createRideGroupSchema>;

export const joinRideGroupSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export type JoinRideGroupInput = z.infer<typeof joinRideGroupSchema>;

export const statsQuerySchema = z.object({
  userId: z.coerce.number().int().positive().default(1),
});
