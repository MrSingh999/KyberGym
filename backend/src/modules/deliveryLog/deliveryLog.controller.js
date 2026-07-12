import { DeliveryLogService } from "./deliveryLog.service.js";
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from "http-status";

export class DeliveryLogController {
  static async getLogs(req, res) {
    const gymId = req.gym._id;
    const result = await DeliveryLogService.getLogs(gymId, req.query);

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Delivery logs retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }

  static async getLogById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;

    const log = await DeliveryLogService.getLogById(id, gymId);
    return ApiResponse.success(
      res,
      httpStatus.OK,
      "Delivery log retrieved successfully",
      log,
    );
  }
}
