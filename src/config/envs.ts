import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { ZodError, z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_DATABASE: z.string().min(1),
});

export type EnvSchema = z.infer<typeof envSchema>;

const parseEnv = () => {
  try {
    return envSchema.parse({
      ...process.env,
    });
  } catch (error) {
    const logger = new Logger('Config');
    logger.error({ envError: (error as ZodError).issues });
    throw new Error('Invalid environment variables');
  }
};

export const envs = parseEnv();
