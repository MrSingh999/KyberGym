import { Member } from '../member/models/Member.model.js';
import { Payment } from '../payment/models/Payment.model.js';
import { MemberSubscription } from '../memberSubscription/models/MemberSubscription.model.js';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, addDays } from 'date-fns';

export class DashboardService {
  static async getOverviewStats(gymId) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      expiredMembers,
      monthlyCollection
    ] = await Promise.all([
      Member.countDocuments({ gymId, isDeleted: false }),
      Member.countDocuments({ gymId, isDeleted: false, status: 'active' }),
      Member.countDocuments({ gymId, isDeleted: false, status: 'inactive' }),
      Member.countDocuments({ gymId, isDeleted: false, status: 'expired' }),
      
      // Aggregate monthly payments
      Payment.aggregate([
        { 
          $match: { 
            gymId, 
            status: 'completed',
            paymentDate: { $gte: monthStart, $lte: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      expiredMembers,
      monthlyCollection: monthlyCollection[0]?.total || 0
    };
  }

  static async getDueTracking(gymId) {
    const today = new Date();
    
    // Overdue & Due Today: End date is today or in the past (status must remain 'active' to still be considered a member)
    const dueTodayStart = startOfDay(today);
    const dueTodayEnd = endOfDay(today);

    // Due within next 3 days: from tomorrow up to today + 3
    const due3DaysStart = startOfDay(addDays(today, 1));
    const due3DaysEnd = endOfDay(addDays(today, 3));

    // Due within next 7 days: from today + 4 up to today + 7
    const due7DaysStart = startOfDay(addDays(today, 4));
    const due7DaysEnd = endOfDay(addDays(today, 7));

    const [overdue, dueToday, dueIn3Days, dueIn7Days] = await Promise.all([
      // Subscriptions that ended before today but member is still active
      MemberSubscription.find({ gymId, status: 'active', endDate: { $lt: dueTodayStart } })
        .populate('memberId', 'fullName memberCode phone email'),

      // Ending today
      MemberSubscription.find({ gymId, status: 'active', endDate: { $gte: dueTodayStart, $lte: dueTodayEnd } })
        .populate('memberId', 'fullName memberCode phone email'),

      // Ending in 1–3 days
      MemberSubscription.find({ gymId, status: 'active', endDate: { $gte: due3DaysStart, $lte: due3DaysEnd } })
        .populate('memberId', 'fullName memberCode phone email'),

      // Ending in 4–7 days
      MemberSubscription.find({ gymId, status: 'active', endDate: { $gte: due7DaysStart, $lte: due7DaysEnd } })
        .populate('memberId', 'fullName memberCode phone email'),
    ]);

    return {
      overdue,
      dueToday,
      dueIn3Days,
      dueIn7Days,
    };
  }
}
