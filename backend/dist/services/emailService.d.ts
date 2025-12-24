export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private transporter;
    constructor();
    sendEmail(options: EmailOptions): Promise<void>;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    private generateVerificationEmailTemplate;
    sendWelcomeEmail(email: string, firstName?: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
    private generateWelcomeEmailTemplate;
    private generatePasswordResetEmailTemplate;
}
//# sourceMappingURL=emailService.d.ts.map