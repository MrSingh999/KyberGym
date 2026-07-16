import { UserService } from './users.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class UserController {

  static async listUsers(req, res) {
    const result = await UserService.listUsers(req.gym._id, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Users retrieved', result.users, result.meta);
  }

  static async getUserById(req, res) {
    const user = await UserService.getUserById(req.gym._id, req.params.id);
    return ApiSuccess.send(res, httpStatus.OK, 'User retrieved', user);
  }

  static async updateUser(req, res) {
    const user = await UserService.updateUser(req.gym._id, req.params.id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'User updated', user);
  }

  static async deleteUser(req, res) {
    const user = await UserService.deleteUser(req.gym._id, req.params.id);
    return ApiSuccess.send(res, httpStatus.OK, 'User deleted', user);
  }
}
