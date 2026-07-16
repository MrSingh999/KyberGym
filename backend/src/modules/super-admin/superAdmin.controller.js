import httpStatus from 'http-status';
import { SuperAdminService } from './superAdmin.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';

export class SuperAdminController {

  static async getProfile(req, res) {
    return ApiSuccess.send(res, httpStatus.OK, 'Profile retrieved', {
      superAdmin: {
        id: req.superAdmin._id,
        fullName: req.superAdmin.fullName,
        email: req.superAdmin.email,
      },
    });
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const { superAdmin, token } = await SuperAdminService.login(email, password);

    return ApiSuccess.send(res, httpStatus.OK, 'Super Admin login successful', {
      superAdmin: {
        id: superAdmin._id,
        fullName: superAdmin.fullName,
        email: superAdmin.email,
      },
      token,
    });
  }

  static async getDashboard(req, res) {
    const stats = await SuperAdminService.getDashboard();
    return ApiSuccess.send(res, httpStatus.OK, 'Dashboard stats retrieved', stats);
  }

  static async getGyms(req, res) {
    const result = await SuperAdminService.getGyms(req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Gyms retrieved', result.gyms, result.meta);
  }

  static async getGymById(req, res) {
    const gym = await SuperAdminService.getGymById(req.params.id);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym retrieved', gym);
  }

  static async createGym(req, res) {
    const result = await SuperAdminService.createGym(req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Gym created successfully', result);
  }

  static async updateGym(req, res) {
    const gym = await SuperAdminService.updateGym(req.params.id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym updated successfully', gym);
  }

  static async deleteGym(req, res) {
    const gym = await SuperAdminService.deleteGym(req.params.id);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym deleted successfully', gym);
  }

  static async permanentDeleteGym(req, res) {
    const gym = await SuperAdminService.permanentDeleteGym(req.params.id);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym permanently deleted successfully', gym);
  }

  static async suspendGym(req, res) {
    const gym = await SuperAdminService.suspendGym(req.params.id);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym suspended successfully', gym);
  }

  static async activateGym(req, res) {
    const gym = await SuperAdminService.activateGym(req.params.id);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym activated successfully', gym);
  }

  static async restoreGym(req, res) {
    const gym = await SuperAdminService.restoreGym(req.params.id);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym restored successfully', gym);
  }

  static async updateFeatures(req, res) {
    const gym = await SuperAdminService.updateFeatures(req.params.id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Features updated successfully', gym);
  }

  static async getSubscription(req, res) {
    const subscription = await SuperAdminService.getSubscription(req.params.id);
    return ApiSuccess.send(res, httpStatus.OK, 'Subscription retrieved', subscription);
  }

  static async updateSubscription(req, res) {
    const gym = await SuperAdminService.updateSubscription(req.params.id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Subscription updated successfully', gym);
  }

  static async renewSubscription(req, res) {
    const gym = await SuperAdminService.renewSubscription(req.params.id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Subscription renewed successfully', gym);
  }

  static async updateSubscriptionStatus(req, res) {
    const gym = await SuperAdminService.updateSubscriptionStatus(req.params.id, req.body.status);
    return ApiSuccess.send(res, httpStatus.OK, 'Subscription status updated successfully', gym);
  }

  static async manageTrial(req, res) {
    const gym = await SuperAdminService.manageTrial(req.params.id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Trial updated successfully', gym);
  }

  // ── User Management per Gym ──────────────────────────────────────────────
  static async getGymUsers(req, res) {
    const result = await SuperAdminService.getGymUsers(req.params.id, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Users retrieved', result.users, result.meta);
  }

  static async getGymUserById(req, res) {
    const user = await SuperAdminService.getGymUserById(req.params.id, req.params.userId);
    return ApiSuccess.send(res, httpStatus.OK, 'User retrieved', user);
  }

  static async updateGymUser(req, res) {
    const user = await SuperAdminService.updateGymUser(req.params.id, req.params.userId, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'User updated', user);
  }

  static async deleteGymUser(req, res) {
    const user = await SuperAdminService.deleteGymUser(req.params.id, req.params.userId);
    return ApiSuccess.send(res, httpStatus.OK, 'User deleted', user);
  }
}
