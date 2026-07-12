import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export class WhatsappService {
  /**
   * Mock Meta Cloud API Sender
   */
  static async sendTemplateMessage({ to, templateName, variables }) {
    try {
      logger.info(`[WhatsappService] Sending template '${templateName}' to ${to}`);
      
      // MOCK IMPLEMENTATION
      // Real implementation would use axios to POST to graph.facebook.com/v17.0/...
      
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      return {
        success: true,
        messageId: `wamid_mock_${Date.now()}`
      };
    } catch (error) {
      logger.error(`[WhatsappService] Failed to send to ${to}: ${error.message}`);
      throw error;
    }
  }

  static async sendTextMessage({ to, text }) {
    try {
      logger.info(`[WhatsappService] Sending text to ${to}`);
      
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      return {
        success: true,
        messageId: `wamid_mock_${Date.now()}`
      };
    } catch (error) {
      logger.error(`[WhatsappService] Failed to send to ${to}: ${error.message}`);
      throw error;
    }
  }
}
