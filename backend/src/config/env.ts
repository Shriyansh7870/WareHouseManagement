import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/quantum_invenza'),
  JWT_SECRET: z.string().default('quantum-invenza-dev-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('quantum-invenza-refresh-secret'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
