import { authService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const REFRESH_COOKIE = 'artmind_rt';
const cookieOpts = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
    res.status(201).json({ success: true, data: { user, accessToken } });
  }),

  login: asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
    res.json({ success: true, data: { user, accessToken } });
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken;
    const { accessToken, refreshToken } = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
    res.json({ success: true, data: { accessToken } });
  }),

  logout: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
    await authService.logout(req.user?.id, token);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    res.json({ success: true, data: { message: 'Logged out' } });
  }),
};
