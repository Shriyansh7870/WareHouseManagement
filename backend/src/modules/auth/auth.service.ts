import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { addDays } from 'date-fns';

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );

  const refreshTokenValue = jwt.sign(
    { userId: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' as any }
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: addDays(new Date(), 7),
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) {
    throw Object.assign(new Error('User not found'), { statusCode: 401 });
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );

  return { accessToken };
}

export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}
