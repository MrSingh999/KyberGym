import mongoose from 'mongoose';

export class HealthCheckController {
  
  // Basic liveness probe (HTTP 200)
  static liveness(req, res) {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
  }

  // Deep readiness probe
  static async readiness(req, res) {
    let mongoStatus = 'DOWN';
    let isReady = true;

    try {
      // Check MongoDB
      if (mongoose.connection.readyState === 1) {
        mongoStatus = 'UP';
      } else {
        isReady = false;
      }

      const statusCode = isReady ? 200 : 503;
      
      res.status(statusCode).json({
        status: isReady ? 'READY' : 'NOT_READY',
        timestamp: new Date(),
        checks: {
          mongo: mongoStatus
        }
      });
    } catch (error) {
      res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date(),
        error: error.message
      });
    }
  }
}
