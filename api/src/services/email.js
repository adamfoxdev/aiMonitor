import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
const isEnabled = !!apiKey;

if (isEnabled) {
  sgMail.setApiKey(apiKey);
  console.log('✓ Email service enabled (SendGrid)');
} else {
  console.log('ℹ Email service disabled (SENDGRID_API_KEY not set) - emails will be skipped');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@aimonitor.com';

export const sendPasswordResetEmail = async (email, resetToken, frontendBaseUrl) => {
  if (!isEnabled) {
    console.log(`[MOCK EMAIL] Password reset email to ${email}`);
    return { success: true };
  }

  const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}`;
  
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Reset Your aiMonitor Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password for your aiMonitor account.</p>
      <p>Click the link below to reset your password (link expires in 1 hour):</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #6366F1; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Reset Password
      </a>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        If you didn't request this, please ignore this email.<br>
        Or copy this link in your browser: ${resetLink}
      </p>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send reset email: ' + error.message);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  if (!isEnabled) {
    console.log(`[MOCK EMAIL] Welcome email to ${email}`);
    return { success: true };
  }

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Welcome to aiMonitor! 🎉',
    html: `
      <h2>Welcome to aiMonitor, ${name}!</h2>
      <p>Your account has been successfully created.</p>
      <p>You can now log in to your dashboard and start monitoring your AI costs.</p>
      <a href="https://aimonitor.com/login" style="display: inline-block; padding: 12px 24px; background: #6366F1; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0;">
        Go to Dashboard
      </a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        Questions? Reply to this email or visit our help center.
      </p>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - this is non-critical
    return { success: false, error: error.message };
  }
};

export const sendTeamInviteEmail = async (email, teamName, inviteLink) => {
  if (!isEnabled) {
    console.log(`[MOCK EMAIL] Team invite to ${email} for ${teamName}`);
    return { success: true };
  }

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: `You've been invited to join ${teamName} on aiMonitor`,
    html: `
      <h2>Team Invitation</h2>
      <p>You've been invited to join the team <strong>${teamName}</strong> on aiMonitor.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: #6366F1; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Accept Invitation
      </a>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        This invitation expires in 7 days.
      </p>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending team invite email:', error);
    throw new Error('Failed to send invitation: ' + error.message);
  }
};

export const sendAlertEmail = async (email, teamName, alertMessage) => {
  if (!isEnabled) {
    console.log(`[MOCK EMAIL] Alert to ${email}: ${alertMessage}`);
    return { success: true };
  }

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: `⚠️ Cost Alert: ${teamName}`,
    html: `
      <h2>Cost Alert</h2>
      <p>Your team <strong>${teamName}</strong> has triggered a cost alert:</p>
      <p>${alertMessage}</p>
      <a href="https://aimonitor.com/dashboard" style="display: inline-block; padding: 12px 24px; background: #F59E0B; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0;">
        View Dashboard
      </a>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending alert email:', error);
    return { success: false, error: error.message };
  }
};

export const verifyEmailConnection = async () => {
  if (!isEnabled) {
    console.log('ℹ Email service is disabled');
    return true;
  }

  try {
    // Test SendGrid by sending a test email to a test address
    const msg = {
      to: process.env.FROM_EMAIL,
      from: FROM_EMAIL,
      subject: 'SendGrid Connection Test',
      text: 'If you received this, SendGrid is working correctly.',
    };
    await sgMail.send(msg);
    console.log('✓ Email service connected to SendGrid');
    return true;
  } catch (error) {
    console.error('✗ Email service connection failed:', error.message);
    return false;
  }
};
