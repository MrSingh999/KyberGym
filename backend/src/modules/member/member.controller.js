import { MemberService } from './member.service.js';
import { ApiResponse } from '../../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class MemberController {
  
  static async createMember(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    
    const member = await MemberService.createMember(gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Member created successfully', member);
  }

  static async getMembers(req, res) {
    const gymId = req.gym._id;
    const result = await MemberService.getMembers(gymId, req.query);
    
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Members retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }

  static async getMemberById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const member = await MemberService.getMemberById(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Member retrieved successfully', member);
  }

  static async updateMember(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const { id } = req.params;
    
    const member = await MemberService.updateMember(id, gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Member updated successfully', member);
  }

  static async deleteMember(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const { id } = req.params;
    
    const member = await MemberService.deleteMember(id, gymId, userId);
    return ApiResponse.success(res, httpStatus.OK, 'Member deleted successfully', member);
  }
}
