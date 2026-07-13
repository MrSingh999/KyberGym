import mongoose from 'mongoose';

export class HealthCheckController {

  static async check(req, res) {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.status(dbStatus === 'connected' ? 200 : 503).json({
      status: 'ok',
      database: dbStatus,
      uptime: process.uptime(),
    });
  }
}
