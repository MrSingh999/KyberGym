import { GymService } from './gym.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class GymController {

  static async getMyGym(req, res) {
    const gym = await GymService.getMyGym(req.gym._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym retrieved', gym);
  }

  static async getGymById(req, res) {
    const gym = await GymService.getMyGym(req.params.gymId);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym retrieved', gym);
  }

  static async updateMyGym(req, res) {
    const gym = await GymService.updateMyGym(req.gym._id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym updated', gym);
  }

  static async getBranding(req, res) {
    const gymId = req.params.gymId;
    const branding = await GymService.getBranding(gymId);
    return ApiSuccess.send(res, httpStatus.OK, 'Branding settings retrieved', branding);
  }

  static async updateBranding(req, res) {
    const gymId = req.params.gymId;
    const branding = await GymService.updateBranding(gymId, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Branding settings updated', branding);
  }
}
