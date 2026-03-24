import { Request, Response, NextFunction } from 'express';
import { loginSchema } from './auth.schema';
import * as authService from './auth.service';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.loginUser(email, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
    const result = await authService.refreshAccessToken(token);
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await authService.logoutUser(token);
    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response) {
  return res.json({ success: true, data: req.user });
}
