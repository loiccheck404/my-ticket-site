"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        // Create transporter
        // For development, you can use Gmail or a service like Mailtrap
        this.transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com", // Use Gmail SMTP
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER || "your-email@gmail.com", // Your Gmail
                pass: process.env.EMAIL_PASSWORD || "your-app-password", // Gmail App Password
            },
        });
    }
    /**
     * Send order confirmation email
     */
    async sendOrderConfirmation(data) {
        try {
            const emailHTML = this.generateOrderConfirmationHTML(data);
            const info = await this.transporter.sendMail({
                from: '"Premium Tickets" <noreply@premiumtickets.com>',
                to: data.userEmail,
                subject: `Order Confirmation #${data.orderId.slice(0, 8)}`,
                html: emailHTML,
            });
            console.log("Email sent:", info.messageId);
            return true;
        }
        catch (error) {
            console.error("Error sending email:", error);
            return false;
        }
    }
    /**
     * Generate HTML email template
     */
    generateOrderConfirmationHTML(data) {
        const ticketRows = data.tickets
            .map((ticket) => `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 15px; color: #fff;">${ticket.matchTitle}</td>
        <td style="padding: 15px; color: #FFD700;">${ticket.ticketType}</td>
        <td style="padding: 15px; color: #fff;">${ticket.section}-${ticket.row}-${ticket.seatNumber}</td>
        <td style="padding: 15px; color: #FFD700; font-weight: bold;">$${ticket.price}</td>
      </tr>
    `)
            .join("");
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 2px solid #FFD700; border-radius: 10px;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #000; font-size: 32px;">🎉 Order Confirmed!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #fff; font-size: 18px; margin: 0 0 20px;">
                Hi <strong style="color: #FFD700;">${data.userName}</strong>,
              </p>
              
              <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                Thank you for your order! Your tickets have been confirmed and are ready to use.
              </p>

              <!-- Order Details Box -->
              <table width="100%" style="margin: 30px 0; background-color: #000; border: 1px solid #FFD700; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #FFD700; font-size: 14px; margin: 0 0 10px;">ORDER ID</p>
                    <p style="color: #fff; font-size: 20px; margin: 0; font-family: monospace;">#${data.orderId.slice(0, 8)}...</p>
                  </td>
                  <td style="padding: 20px; text-align: right;">
                    <p style="color: #FFD700; font-size: 14px; margin: 0 0 10px;">TOTAL AMOUNT</p>
                    <p style="color: #fff; font-size: 28px; margin: 0; font-weight: bold;">$${data.totalAmount}</p>
                  </td>
                </tr>
              </table>

              <!-- Tickets Table -->
              <h2 style="color: #FFD700; font-size: 20px; margin: 30px 0 15px; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
                Your Tickets
              </h2>
              
              <table width="100%" style="border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background-color: #000; border-bottom: 2px solid #FFD700;">
                    <th style="padding: 15px; text-align: left; color: #FFD700;">Match</th>
                    <th style="padding: 15px; text-align: left; color: #FFD700;">Type</th>
                    <th style="padding: 15px; text-align: left; color: #FFD700;">Seat</th>
                    <th style="padding: 15px; text-align: left; color: #FFD700;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketRows}
                </tbody>
              </table>

              <!-- Download Button -->
              <table width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:5000/api/tickets/download/${data.orderId}" 
                       style="display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); 
                              color: #000; padding: 15px 40px; text-decoration: none; font-weight: bold; 
                              font-size: 16px; border-radius: 8px; margin: 10px 0;">
                      📄 Download Your Tickets (PDF)
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Important Info -->
              <table width="100%" style="margin: 30px 0; background-color: #222; padding: 20px; border-left: 4px solid #FFD700;">
                <tr>
                  <td>
                    <p style="color: #FFD700; font-size: 16px; font-weight: bold; margin: 0 0 10px;">
                      ⚠️ Important Information
                    </p>
                    <ul style="color: #ccc; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Please arrive 30 minutes before the match starts</li>
                      <li>Present your ticket and valid ID at the entrance</li>
                      <li>Tickets are non-transferable and non-refundable</li>
                      <li>Your QR code will be scanned at entry gates</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Payment Method -->
              <p style="color: #888; font-size: 14px; margin: 30px 0 0;">
                Payment Method: <strong style="color: #FFD700;">${data.paymentMethod}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #000; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #333;">
              <p style="color: #888; font-size: 14px; margin: 0 0 10px;">
                Need help? Contact us at <a href="mailto:support@premiumtickets.com" style="color: #FFD700; text-decoration: none;">support@premiumtickets.com</a>
              </p>
              <p style="color: #666; font-size: 12px; margin: 0;">
                © 2025 Premium Tickets. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }
    /**
     * Test email configuration
     */
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log("✅ Email server is ready to send emails");
            return true;
        }
        catch (error) {
            console.error("❌ Email server connection failed:", error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
