"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
const emailService = new emailService_1.EmailService();
// Contact form submission endpoint
router.post('/contact', [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('subject')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Subject must be between 5 and 200 characters'),
    (0, express_validator_1.body)('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { name, email, subject, message } = req.body;
        // Send contact inquiry email to studio
        const studioEmail = process.env.STUDIO_EMAIL || 'contact@motionstudio.com';
        const contactEmailHtml = generateContactEmailTemplate({
            name,
            email,
            subject,
            message,
            submittedAt: new Date().toISOString()
        });
        const contactEmailText = `
New Contact Form Submission

From: ${name} (${email})
Subject: ${subject}
Submitted: ${new Date().toLocaleString()}

Message:
${message}

---
This message was sent via the Motion Design Studio contact form.
    `.trim();
        await emailService.sendEmail({
            to: studioEmail,
            subject: `Contact Form: ${subject}`,
            html: contactEmailHtml,
            text: contactEmailText
        });
        // Send confirmation email to user
        const confirmationEmailHtml = generateConfirmationEmailTemplate(name);
        const confirmationEmailText = `
Hi ${name},

Thank you for contacting Motion Design Studio! We've received your message and will get back to you within 24-48 hours.

In the meantime, feel free to explore our courses and portfolio:
- Browse Courses: ${process.env.FRONTEND_URL}/courses
- View Portfolio: ${process.env.FRONTEND_URL}/portfolio

Best regards,
Motion Design Studio Team
    `.trim();
        await emailService.sendEmail({
            to: email,
            subject: 'Thank you for contacting Motion Design Studio',
            html: confirmationEmailHtml,
            text: confirmationEmailText
        });
        res.status(200).json({
            success: true,
            message: 'Contact form submitted successfully. We\'ll get back to you soon!'
        });
    }
    catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit contact form. Please try again later.'
        });
    }
});
// Project inquiry form submission endpoint
router.post('/project-inquiry', [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name must be less than 100 characters'),
    (0, express_validator_1.body)('projectType')
        .isIn(['brand-animation', 'explainer-video', 'ui-animation', 'logo-animation', 'social-media', 'other'])
        .withMessage('Please select a valid project type'),
    (0, express_validator_1.body)('budget')
        .isIn(['under-5k', '5k-10k', '10k-25k', '25k-50k', 'over-50k'])
        .withMessage('Please select a valid budget range'),
    (0, express_validator_1.body)('timeline')
        .isIn(['asap', '1-2-weeks', '1-month', '2-3-months', 'flexible'])
        .withMessage('Please select a valid timeline'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage('Project description must be between 20 and 2000 characters'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { name, email, company, projectType, budget, timeline, description } = req.body;
        // Send project inquiry email to studio
        const studioEmail = process.env.STUDIO_EMAIL || 'projects@motionstudio.com';
        const projectEmailHtml = generateProjectInquiryEmailTemplate({
            name,
            email,
            company,
            projectType,
            budget,
            timeline,
            description,
            submittedAt: new Date().toISOString()
        });
        const projectEmailText = `
New Project Inquiry

From: ${name} (${email})
Company: ${company || 'Not specified'}
Project Type: ${formatProjectType(projectType)}
Budget: ${formatBudget(budget)}
Timeline: ${formatTimeline(timeline)}
Submitted: ${new Date().toLocaleString()}

Project Description:
${description}

---
This inquiry was sent via the Motion Design Studio project inquiry form.
    `.trim();
        await emailService.sendEmail({
            to: studioEmail,
            subject: `Project Inquiry: ${formatProjectType(projectType)} - ${name}`,
            html: projectEmailHtml,
            text: projectEmailText
        });
        // Send confirmation email to client
        const clientConfirmationHtml = generateProjectConfirmationEmailTemplate(name, projectType);
        const clientConfirmationText = `
Hi ${name},

Thank you for your project inquiry! We're excited about the possibility of working together on your ${formatProjectType(projectType).toLowerCase()} project.

We've received your inquiry and will review it carefully. Our team will get back to you within 24-48 hours with next steps.

In the meantime, you can view our portfolio to see examples of our work:
${process.env.FRONTEND_URL}/portfolio

Best regards,
Motion Design Studio Team
    `.trim();
        await emailService.sendEmail({
            to: email,
            subject: 'Thank you for your project inquiry - Motion Design Studio',
            html: clientConfirmationHtml,
            text: clientConfirmationText
        });
        res.status(200).json({
            success: true,
            message: 'Project inquiry submitted successfully. We\'ll review your project and get back to you soon!'
        });
    }
    catch (error) {
        console.error('Project inquiry submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit project inquiry. Please try again later.'
        });
    }
});
// Helper functions for formatting
function formatProjectType(type) {
    const types = {
        'brand-animation': 'Brand Animation',
        'explainer-video': 'Explainer Video',
        'ui-animation': 'UI Animation',
        'logo-animation': 'Logo Animation',
        'social-media': 'Social Media Content',
        'other': 'Other'
    };
    return types[type] || type;
}
function formatBudget(budget) {
    const budgets = {
        'under-5k': 'Under $5,000',
        '5k-10k': '$5,000 - $10,000',
        '10k-25k': '$10,000 - $25,000',
        '25k-50k': '$25,000 - $50,000',
        'over-50k': 'Over $50,000'
    };
    return budgets[budget] || budget;
}
function formatTimeline(timeline) {
    const timelines = {
        'asap': 'ASAP',
        '1-2-weeks': '1-2 weeks',
        '1-month': '1 month',
        '2-3-months': '2-3 months',
        'flexible': 'Flexible'
    };
    return timelines[timeline] || timeline;
}
// Email template generators
function generateContactEmailTemplate(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
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
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #2B2B2E;
            margin: 0;
        }
        .field {
            margin-bottom: 20px;
        }
        .field-label {
            font-weight: 600;
            color: #2B2B2E;
            margin-bottom: 5px;
        }
        .field-value {
            color: #2B2B2E;
            background-color: white;
            padding: 10px;
            border-radius: 6px;
            border-left: 4px solid #C89AA6;
        }
        .message-field {
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="header">
                <h1>New Contact Form Submission</h1>
            </div>
            
            <div class="field">
                <div class="field-label">From:</div>
                <div class="field-value">${data.name} (${data.email})</div>
            </div>
            
            <div class="field">
                <div class="field-label">Subject:</div>
                <div class="field-value">${data.subject}</div>
            </div>
            
            <div class="field">
                <div class="field-label">Submitted:</div>
                <div class="field-value">${new Date(data.submittedAt).toLocaleString()}</div>
            </div>
            
            <div class="field">
                <div class="field-label">Message:</div>
                <div class="field-value message-field">${data.message}</div>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}
function generateConfirmationEmailTemplate(name) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank you for contacting us</title>
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
            margin: 10px;
            transition: background-color 0.3s ease;
        }
        .cta-button:hover {
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
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="logo">
                <h1>Motion Design Studio</h1>
            </div>
            
            <div class="content">
                <h2>Thank you, ${name}!</h2>
                
                <p>We've received your message and will get back to you within 24-48 hours.</p>
                
                <p>In the meantime, feel free to explore our work and courses:</p>
                
                <div>
                    <a href="${process.env.FRONTEND_URL}/portfolio" class="cta-button">View Portfolio</a>
                    <a href="${process.env.FRONTEND_URL}/courses" class="cta-button">Browse Courses</a>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for your interest in Motion Design Studio!</p>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}
function generateProjectInquiryEmailTemplate(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project Inquiry</title>
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
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #2B2B2E;
            margin: 0;
        }
        .field {
            margin-bottom: 20px;
        }
        .field-label {
            font-weight: 600;
            color: #2B2B2E;
            margin-bottom: 5px;
        }
        .field-value {
            color: #2B2B2E;
            background-color: white;
            padding: 10px;
            border-radius: 6px;
            border-left: 4px solid #C89AA6;
        }
        .description-field {
            white-space: pre-wrap;
        }
        .project-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        @media (max-width: 600px) {
            .project-details {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="header">
                <h1>New Project Inquiry</h1>
            </div>
            
            <div class="field">
                <div class="field-label">From:</div>
                <div class="field-value">${data.name} (${data.email})</div>
            </div>
            
            ${data.company ? `
            <div class="field">
                <div class="field-label">Company:</div>
                <div class="field-value">${data.company}</div>
            </div>
            ` : ''}
            
            <div class="project-details">
                <div class="field">
                    <div class="field-label">Project Type:</div>
                    <div class="field-value">${formatProjectType(data.projectType)}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">Budget:</div>
                    <div class="field-value">${formatBudget(data.budget)}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">Timeline:</div>
                    <div class="field-value">${formatTimeline(data.timeline)}</div>
                </div>
                
                <div class="field">
                    <div class="field-label">Submitted:</div>
                    <div class="field-value">${new Date(data.submittedAt).toLocaleString()}</div>
                </div>
            </div>
            
            <div class="field">
                <div class="field-label">Project Description:</div>
                <div class="field-value description-field">${data.description}</div>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}
function generateProjectConfirmationEmailTemplate(name, projectType) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank you for your project inquiry</title>
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
            margin: 10px;
            transition: background-color 0.3s ease;
        }
        .cta-button:hover {
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
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="logo">
                <h1>Motion Design Studio</h1>
            </div>
            
            <div class="content">
                <h2>Thank you, ${name}!</h2>
                
                <p>We're excited about the possibility of working together on your ${formatProjectType(projectType).toLowerCase()} project.</p>
                
                <p>We've received your inquiry and will review it carefully. Our team will get back to you within 24-48 hours with next steps.</p>
                
                <p>In the meantime, you can view our portfolio to see examples of our work:</p>
                
                <a href="${process.env.FRONTEND_URL}/portfolio" class="cta-button">View Our Portfolio</a>
            </div>
            
            <div class="footer">
                <p>Thank you for considering Motion Design Studio for your project!</p>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}
exports.default = router;
//# sourceMappingURL=contact.js.map