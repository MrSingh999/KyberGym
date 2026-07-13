import { DeliveryLogService } from "./deliveryLog.service.js";
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from "http-status";

export class DeliveryLogController {
  static async getLogs(req, res) {
    const gymId = req.gym._id;
    const result = await DeliveryLogService.getLogs(gymId, req.query);

    return ApiSuccess.send(res, httpStatus.OK, "Delivery logs retrieved successfully", result.data, result.meta);
  }

  static async getLogById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;

    const log = await DeliveryLogService.getLogById(id, gymId);
    return ApiSuccess.send(
      res,
      httpStatus.OK,
      "Delivery log retrieved successfully",
      log,
    );
  }
}
