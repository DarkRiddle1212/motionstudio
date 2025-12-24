"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = require("../utils/prisma");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
});
class PaymentService {
    /**
     * Create a Stripe checkout session for course payment
     */
    static async createCheckoutSession(data) {
        const { courseId, studentId, successUrl, cancelUrl } = data;
        // Get course details
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
            include: { instructor: true }
        });
        if (!course) {
            throw new Error('Course not found');
        }
        if (course.pricing === 0) {
            throw new Error('Cannot create payment session for free course');
        }
        // Check if student is already enrolled
        const existingEnrollment = await prisma_1.prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });
        if (existingEnrollment) {
            throw new Error('Student is already enrolled in this course');
        }
        // Create payment record in pending state
        const payment = await prisma_1.prisma.payment.create({
            data: {
                studentId,
                courseId,
                amount: course.pricing,
                currency: course.currency,
                status: 'pending',
                paymentProvider: 'stripe',
                transactionId: '', // Will be updated after session creation
            }
        });
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: course.currency.toLowerCase(),
                        product_data: {
                            name: course.title,
                            description: course.description,
                        },
                        unit_amount: Math.round(course.pricing * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
            metadata: {
                courseId,
                studentId,
                paymentId: payment.id,
            },
        });
        // Update payment record with session ID
        await prisma_1.prisma.payment.update({
            where: { id: payment.id },
            data: { transactionId: session.id }
        });
        return {
            sessionId: session.id,
            url: session.url
        };
    }
    /**
     * Handle Stripe webhook events
     */
    static async handleWebhook(event) {
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }
    /**
     * Handle successful checkout session completion
     */
    static async handleCheckoutSessionCompleted(session) {
        const { courseId, studentId, paymentId } = session.metadata;
        try {
            // Update payment status
            await prisma_1.prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'completed' }
            });
            // Create enrollment for the student - check if already enrolled first
            const existingEnrollment = await prisma_1.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId,
                        courseId
                    }
                }
            });
            if (!existingEnrollment) {
                await prisma_1.prisma.enrollment.create({
                    data: {
                        studentId,
                        courseId,
                        enrolledAt: new Date(),
                        status: 'active',
                        progressPercentage: 0
                    }
                });
            }
            console.log(`Payment completed and enrollment created for student ${studentId} in course ${courseId}`);
        }
        catch (error) {
            console.error('Error handling checkout session completion:', error);
            // Update payment status to failed if enrollment creation fails
            await prisma_1.prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'failed' }
            });
        }
    }
    /**
     * Handle failed payment
     */
    static async handlePaymentFailed(paymentIntent) {
        // Find payment by transaction ID (checkout session ID is stored in payment_intent metadata)
        const payment = await prisma_1.prisma.payment.findFirst({
            where: { transactionId: paymentIntent.id }
        });
        if (payment) {
            await prisma_1.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'failed' }
            });
            console.log(`Payment failed for payment ID: ${payment.id}`);
        }
    }
    /**
     * Get payment status by payment ID
     */
    static async getPaymentStatus(paymentId) {
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        pricing: true,
                        currency: true
                    }
                },
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        if (!payment) {
            throw new Error('Payment not found');
        }
        return payment;
    }
    /**
     * Get payment status by session ID
     */
    static async getPaymentStatusBySessionId(sessionId) {
        const payment = await prisma_1.prisma.payment.findFirst({
            where: { transactionId: sessionId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        pricing: true,
                        currency: true
                    }
                },
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        if (!payment) {
            throw new Error('Payment not found');
        }
        return payment;
    }
    /**
     * Enroll student after payment verification
     */
    static async enrollStudentAfterPayment(paymentId) {
        // Get payment details
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        duration: true,
                        pricing: true,
                        thumbnailUrl: true,
                        isPublished: true
                    }
                },
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        if (!payment) {
            throw new Error('Payment not found');
        }
        if (payment.status !== 'completed') {
            throw new Error('Payment is not completed');
        }
        if (!payment.course.isPublished) {
            throw new Error('Course is not available for enrollment');
        }
        // Check if student is already enrolled
        const existingEnrollment = await prisma_1.prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId: payment.studentId,
                    courseId: payment.courseId
                }
            }
        });
        if (existingEnrollment) {
            return existingEnrollment;
        }
        // Create enrollment
        const enrollment = await prisma_1.prisma.enrollment.create({
            data: {
                studentId: payment.studentId,
                courseId: payment.courseId,
                status: 'active',
                progressPercentage: 0
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        duration: true,
                        pricing: true,
                        thumbnailUrl: true,
                    },
                },
            },
        });
        return enrollment;
    }
    /**
     * Verify webhook signature
     */
    static verifyWebhookSignature(payload, signature) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=paymentService.js.map