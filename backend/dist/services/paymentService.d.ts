import Stripe from 'stripe';
export interface CreateCheckoutSessionData {
    courseId: string;
    studentId: string;
    successUrl: string;
    cancelUrl: string;
}
export interface PaymentSessionResult {
    sessionId: string;
    url: string;
}
export declare class PaymentService {
    /**
     * Create a Stripe checkout session for course payment
     */
    static createCheckoutSession(data: CreateCheckoutSessionData): Promise<PaymentSessionResult>;
    /**
     * Handle Stripe webhook events
     */
    static handleWebhook(event: Stripe.Event): Promise<void>;
    /**
     * Handle successful checkout session completion
     */
    private static handleCheckoutSessionCompleted;
    /**
     * Handle failed payment
     */
    private static handlePaymentFailed;
    /**
     * Get payment status by payment ID
     */
    static getPaymentStatus(paymentId: string): Promise<any>;
    /**
     * Get payment status by session ID
     */
    static getPaymentStatusBySessionId(sessionId: string): Promise<any>;
    /**
     * Enroll student after payment verification
     */
    static enrollStudentAfterPayment(paymentId: string): Promise<any>;
    /**
     * Verify webhook signature
     */
    static verifyWebhookSignature(payload: string, signature: string): Stripe.Event;
}
//# sourceMappingURL=paymentService.d.ts.map