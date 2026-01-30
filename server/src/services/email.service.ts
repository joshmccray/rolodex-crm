import { Resend } from 'resend';
import { db, notifications, leads, users, organizations } from '../db/index.js';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'notifications@rolodexcrm.com';

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  // Send email via Resend
  private async sendEmail(data: EmailData): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('[Email] No API key, skipping email:', data.subject);
        return false;
      }

      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      return true;
    } catch (error) {
      console.error('[Email] Failed to send:', error);
      return false;
    }
  }

  // Send nearby sale alert email
  async sendNearbySaleAlert(notificationId: string): Promise<boolean> {
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
      with: {
        lead: true,
        user: true,
        organization: true,
      },
    });

    if (!notification || !notification.user || !notification.lead) {
      console.error('[Email] Notification or related data not found');
      return false;
    }

    const metadata = notification.metadata as {
      salesCount: number;
      sales: Array<{ address: string; price: number; date: string }>;
    };

    const salesHtml = metadata.sales.map(sale => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${sale.address}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">$${sale.price?.toLocaleString() || 'N/A'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${sale.date || 'N/A'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Sales Alert</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Property activity near your lead</p>
          </div>

          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="margin: 0 0 16px;">Hi ${notification.user.name},</p>

            <p style="margin: 0 0 16px;">
              <strong>${metadata.salesCount} new home${metadata.salesCount > 1 ? 's' : ''}</strong> recently sold near
              <strong>${notification.lead.name}'s</strong> property at ${notification.lead.propertyAddress}.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 12px; text-align: left; font-weight: 600;">Address</th>
                  <th style="padding: 12px; text-align: left; font-weight: 600;">Sale Price</th>
                  <th style="padding: 12px; text-align: left; font-weight: 600;">Date</th>
                </tr>
              </thead>
              <tbody>
                ${salesHtml}
              </tbody>
            </table>

            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/leads/${notification.lead.id}"
                 style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
                View All Nearby Sales
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">You're receiving this because you have market alerts enabled for this lead.</p>
            <p style="margin: 8px 0 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings" style="color: #64748b;">
                Manage notification preferences
              </a>
            </p>
          </div>
        </body>
      </html>
    `;

    const sent = await this.sendEmail({
      to: notification.user.email,
      subject: `🏠 ${metadata.salesCount} new sale${metadata.salesCount > 1 ? 's' : ''} near ${notification.lead.name}'s property`,
      html,
    });

    if (sent) {
      await db.update(notifications)
        .set({ emailSentAt: new Date() })
        .where(eq(notifications.id, notificationId));
    }

    return sent;
  }

  // Send property value change alert
  async sendValueChangeAlert(notificationId: string): Promise<boolean> {
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
      with: {
        lead: true,
        user: true,
      },
    });

    if (!notification || !notification.user || !notification.lead) {
      return false;
    }

    const metadata = notification.metadata as {
      previousValue: number;
      newValue: number;
      change: number;
      percentChange: number;
    };

    const isIncrease = metadata.change > 0;
    const changeColor = isIncrease ? '#10b981' : '#ef4444';
    const changeIcon = isIncrease ? '📈' : '📉';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${changeColor} 0%, ${isIncrease ? '#059669' : '#dc2626'} 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${changeIcon} Property Value Update</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">${notification.lead.name}'s property</p>
          </div>

          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="margin: 0 0 16px;">Hi ${notification.user.name},</p>

            <p style="margin: 0 0 16px;">
              The estimated value of <strong>${notification.lead.name}'s</strong> property at
              ${notification.lead.propertyAddress} has ${isIncrease ? 'increased' : 'decreased'}.
            </p>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <div style="display: inline-block; margin: 0 20px;">
                <div style="color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">Previous Value</div>
                <div style="font-size: 24px; font-weight: 600;">$${metadata.previousValue?.toLocaleString()}</div>
              </div>
              <div style="display: inline-block; font-size: 24px; color: #64748b;">→</div>
              <div style="display: inline-block; margin: 0 20px;">
                <div style="color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">New Value</div>
                <div style="font-size: 24px; font-weight: 600;">$${metadata.newValue?.toLocaleString()}</div>
              </div>
            </div>

            <div style="text-align: center; background: ${changeColor}15; border-radius: 8px; padding: 16px;">
              <span style="font-size: 20px; font-weight: 600; color: ${changeColor};">
                ${isIncrease ? '+' : ''}$${Math.abs(metadata.change).toLocaleString()}
              </span>
              <span style="color: ${changeColor}; margin-left: 8px;">
                (${isIncrease ? '+' : ''}${metadata.percentChange.toFixed(1)}%)
              </span>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/leads/${notification.lead.id}"
                 style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
                View Value History
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">You're receiving this because you have value change alerts enabled.</p>
          </div>
        </body>
      </html>
    `;

    const sent = await this.sendEmail({
      to: notification.user.email,
      subject: `${changeIcon} ${notification.lead.name}'s property value ${isIncrease ? 'increased' : 'decreased'} by ${Math.abs(metadata.percentChange).toFixed(1)}%`,
      html,
    });

    if (sent) {
      await db.update(notifications)
        .set({ emailSentAt: new Date() })
        .where(eq(notifications.id, notificationId));
    }

    return sent;
  }

  // Send user invitation email
  async sendUserInvitation(
    email: string,
    name: string,
    inviteToken: string,
    organizationName: string,
    inviterName: string
  ): Promise<boolean> {
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${inviteToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">You're Invited!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Join ${organizationName} on Rolodex CRM</p>
          </div>

          <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="margin: 0 0 16px;">Hi ${name},</p>

            <p style="margin: 0 0 16px;">
              <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Rolodex CRM.
            </p>

            <p style="margin: 0 0 24px;">
              Rolodex CRM helps real estate agents track leads, monitor nearby sales, and stay on top of property value changes.
            </p>

            <div style="text-align: center;">
              <a href="${inviteUrl}"
                 style="display: inline-block; background: #8b5cf6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 16px;">
                Accept Invitation
              </a>
            </div>

            <p style="margin: 24px 0 0; font-size: 12px; color: #64748b;">
              This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `${inviterName} invited you to join ${organizationName}`,
      html,
    });
  }
}

export const emailService = new EmailService();
