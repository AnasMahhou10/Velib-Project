import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'Le pseudo doit faire au moins 2 caractères')
    .max(50)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Lettres, chiffres, tirets et underscores uniquement',
    ),
  email: z.string().trim().email('Email invalide').transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Mot de passe requis').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
