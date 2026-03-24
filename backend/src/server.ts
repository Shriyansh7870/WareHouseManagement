import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

const PORT = parseInt(env.PORT, 10);

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Quantum Invenza API running on http://localhost:${PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
