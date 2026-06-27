import { userService } from './user.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getPagination, buildMeta } from '../../utils/pagination.js';
import { saveImage } from '../../utils/storage.js';
import { ApiError } from '../../utils/ApiError.js';

export const userController = {
  me: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.getProfile(req.user.id) });
  }),

  updateMe: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.updateProfile(req.user.id, req.body) });
  }),

  changePassword: asyncHandler(async (req, res) => {
    await userService.changePassword(req.user.id, req.body);
    res.json({ success: true, data: { message: 'Password updated' } });
  }),

  uploadAvatar: asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No avatar uploaded (field name: "avatar")');
    const { thumbnailUrl } = await saveImage(req.file.buffer, req.file.mimetype, req);
    res.json({ success: true, data: await userService.updateAvatar(req.user.id, thumbnailUrl) });
  }),

  dashboard: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.getDashboard(req.user.id) });
  }),

  list: asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query, 20);
    const { items, total } = await userService.listUsers({ skip, take });
    res.json({ success: true, data: items, meta: buildMeta(page, limit, total) });
  }),

  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await userService.createUser(req.body) });
  }),

  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.updateUser(Number(req.params.id), req.body) });
  }),

  setRole: asyncHandler(async (req, res) => {
    const data = await userService.setRole(Number(req.params.id), req.body.role);
    res.json({ success: true, data });
  }),

  setStatus: asyncHandler(async (req, res) => {
    const data = await userService.setStatus(Number(req.params.id), req.body.status);
    res.json({ success: true, data });
  }),

  remove: asyncHandler(async (req, res) => {
    await userService.deleteUser(Number(req.params.id));
    res.json({ success: true, data: { message: 'User deleted' } });
  }),
};
