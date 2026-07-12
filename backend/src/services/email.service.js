import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
// import { Resend } from 'resend';
// const resend = new Resend(env.RESEND_API_KEY);

export class EmailService {
  /**
   * Mock Email Sender
   * Uses Resend behind the scenes (commented out for safety/mocking)
   */
  static async sendEmail({ to, subject, html }) {
    try {
      logger.info(`[EmailService] Sending email to ${to}`);
      
      // MOCK IMPLEMENTATION
      // const data = await resend.emails.send({
      //   from: 'KyberGym <noreply@kybergym.com>',
      //   to,
      //   subject,
      //   html
      // });
      
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      return {
        success: true,
        messageId: `resend_mock_${Date.now()}`
      };
    } catch (error) {
      logger.error(`[EmailService] Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
}
