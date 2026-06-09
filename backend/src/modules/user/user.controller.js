import { userService } from './user.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getPagination, buildMeta } from '../../utils/pagination.js';

export const userController = {
  me: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.getProfile(req.user.id) });
  }),

  updateMe: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.updateProfile(req.user.id, req.body) });
  }),

  dashboard: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await userService.getDashboard(req.user.id) });
  }),

  list: asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query, 20);
    const { items, total } = await userService.listUsers({ skip, take });
    res.json({ success: true, data: items, meta: buildMeta(page, limit, total) });
  }),

  setRole: asyncHandler(async (req, res) => {
    const data = await userService.setRole(Number(req.params.id), req.body.role);
    res.json({ success: true, data });
  }),

  remove: asyncHandler(async (req, res) => {
    await userService.deleteUser(Number(req.params.id));
    res.json({ success: true, data: { message: 'User deleted' } });
  }),
};
