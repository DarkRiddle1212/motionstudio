import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@motionstudio.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      // If email credentials are not configured, log the email instead of sending
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('\n📧 Email would be sent (EMAIL_USER/EMAIL_PASSWORD not configured):');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.text || 'HTML content provided');
        console.log('---\n');
        return;
      }

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = this.generateVerificationEmailTemplate(verificationUrl);
    const text = `
Welcome to Motion Design Studio!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
Motion Design Studio Team
    `.trim();

    await this.sendEmail({
      to: email,
      subject: 'Verify your Motion Design Studio account',
      html,
      text,
    });
  }

  private generateVerificationEmailTemplate(verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Motion Design Studio</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2B2B2E;
            background-color: #F6C1CC;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .email-card {
            background-color: #F9D6DC;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #2B2B2E;
            margin: 0;
        }
        .content {
            text-align: center;
        }
        .content h2 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #2B2B2E;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            color: #2B2B2E;
            margin-bottom: 20px;
        }
        .verify-button {
            display: inline-block;
            background-color: #2B2B2E;
            color: #F9D6DC;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }
        .verify-button:hover {
            background-color: #C89AA6;
            color: #2B2B2E;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #C89AA6;
        }
        .footer p {
            font-size: 14px;
            color: #8A8A8E;
        }
        .link {
            color: #C89AA6;
            text-decoration: none;
        }
        .link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="logo">
                <h1>Motion Design Studio</h1>
            </div>
            
            <div class="content">
                <h2>Welcome to Motion Design Studio!</h2>
                
                <p>Thank you for creating an account with us. To get started, please verify your email address by clicking the button below:</p>
                
                <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
                
                <p>This verification link will expire in 24 hours for security reasons.</p>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p><a href="${verificationUrl}" class="link">${verificationUrl}</a></p>
            </div>
            
            <div class="footer">
                <p>If you didn't create an account with Motion Design Studio, please ignore this email.</p>
                <p>Need help? Contact us at <a href="mailto:support@motionstudio.com" class="link">support@motionstudio.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const html = this.generateWelcomeEmailTemplate(firstName);
    const text = `
Welcome to Motion Design Studio${firstName ? `, ${firstName}` : ''}!

Your email has been successfully verified and your account is now active.

You can now:
- Browse our motion design courses
- Enroll in free courses immediately
- Purchase premium courses
- Track your learning progress

Start your motion design journey today by exploring our courses at ${process.env.FRONTEND_URL}/courses

Best regards,
Motion Design Studio Team
    `.trim();

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Motion Design Studio!',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = this.generatePasswordResetEmailTemplate(resetUrl);
    const text = `
Password Reset Request - Motion Design Studio

We received a request to reset your password. Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email.

Best regards,
Motion Design Studio Team
    `.trim();

    await this.sendEmail({
      to: email,
      subject: 'Reset your Motion Design Studio password',
      html,
      text,
    });
  }

  private generateWelcomeEmailTemplate(firstName?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Motion Design Studio</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2B2B2E;
            background-color: #F6C1CC;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .email-card {
            background-color: #F9D6DC;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #2B2B2E;
            margin: 0;
        }
        .content {
            text-align: center;
        }
        .content h2 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #2B2B2E;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            color: #2B2B2E;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2B2B2E;
            color: #F9D6DC;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }
        .cta-button:hover {
            background-color: #C89AA6;
            color: #2B2B2E;
        }
        .features {
            text-align: left;
            margin: 30px 0;
        }
        .features ul {
            list-style: none;
            padding: 0;
        }
        .features li {
            padding: 8px 0;
            padding-left: 20px;
            position: relative;
        }
        .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #C89AA6;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #C89AA6;
        }
        .footer p {
            font-size: 14px;
            color: #8A8A8E;
        }
        .link {
            color: #C89AA6;
            text-decoration: none;
        }
        .link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="logo">
                <h1>Motion Design Studio</h1>
            </div>
            
            <div class="content">
                <h2>Welcome${firstName ? `, ${firstName}` : ''}!</h2>
                
                <p>Your email has been successfully verified and your account is now active. Welcome to the Motion Design Studio community!</p>
                
                <div class="features">
                    <p><strong>You can now:</strong></p>
                    <ul>
                        <li>Browse our comprehensive motion design courses</li>
                        <li>Enroll in free courses immediately</li>
                        <li>Purchase premium courses with exclusive content</li>
                        <li>Track your learning progress and achievements</li>
                        <li>Submit assignments and receive expert feedback</li>
                    </ul>
                </div>
                
                <p>Ready to start your motion design journey?</p>
                
                <a href="${process.env.FRONTEND_URL}/courses" class="cta-button">Explore Courses</a>
            </div>
            
            <div class="footer">
                <p>Thank you for joining Motion Design Studio. We're excited to help you master the art of motion design!</p>
                <p>Need help getting started? Contact us at <a href="mailto:support@motionstudio.com" class="link">support@motionstudio.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  private generatePasswordResetEmailTemplate(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Motion Design Studio</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2B2B2E;
            background-color: #F6C1CC;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .email-card {
            background-color: #F9D6DC;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #2B2B2E;
            margin: 0;
        }
        .content {
            text-align: center;
        }
        .content h2 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #2B2B2E;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            color: #2B2B2E;
            margin-bottom: 20px;
        }
        .reset-button {
            display: inline-block;
            background-color: #2B2B2E;
            color: #F9D6DC;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }
        .reset-button:hover {
            background-color: #C89AA6;
            color: #2B2B2E;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #C89AA6;
        }
        .footer p {
            font-size: 14px;
            color: #8A8A8E;
        }
        .link {
            color: #C89AA6;
            text-decoration: none;
        }
        .link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="logo">
                <h1>Motion Design Studio</h1>
            </div>
            
            <div class="content">
                <h2>Password Reset Request</h2>
                
                <p>We received a request to reset your password for your Motion Design Studio account.</p>
                
                <p>Click the button below to create a new password:</p>
                
                <a href="${resetUrl}" class="reset-button">Reset Password</a>
                
                <p>This reset link will expire in 1 hour for security reasons.</p>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
            </div>
            
            <div class="footer">
                <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                <p>Need help? Contact us at <a href="mailto:support@motionstudio.com" class="link">support@motionstudio.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
}