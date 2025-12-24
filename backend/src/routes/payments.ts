import express, { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/payments/create-checkout
 * Create a Stripe checkout session for course payment
 */
router.post('/create-checkout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, successUrl, cancelUrl } = req.body;
    const studentId = req.user!.userId;

    if (!courseId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'Course ID, success URL, and cancel URL are required'
      });
    }

    const result = await PaymentService.createCheckoutSession({
      courseId,
      studentId,
      successUrl,
      cancelUrl
    });

    res.json({
      sessionId: result.sessionId,
      url: result.url
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (error.message === 'Cannot create payment session for free course') {
      return res.status(400).json({ error: 'Cannot create payment session for free course' });
    }
    
    if (error.message === 'Student is already enrolled in this course') {
      return res.status(409).json({ error: 'Student is already enrolled in this course' });
    }

    res.status(500).json({
      error: 'Failed to create checkout session'
    });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    const event = PaymentService.verifyWebhookSignature(req.body, signature);
    
    await PaymentService.handleWebhook(event);
    
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

/**
 * GET /api/payments/status/:paymentId
 * Get payment status by payment ID
 */
router.get('/status/:paymentId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user!.userId;

    const payment = await PaymentService.getPaymentStatus(paymentId);
    
    // Ensure user can only access their own payments (or if they're an instructor/admin)
    if (payment.studentId !== userId && req.user!.role !== 'instructor' && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(payment);
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    
    if (error.message === 'Payment not found') {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(500).json({
      error: 'Failed to get payment status'
    });
  }
});

/**
 * GET /api/payments/session/:sessionId
 * Get payment status by Stripe session ID
 */
router.get('/session/:sessionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.userId;

    const payment = await PaymentService.getPaymentStatusBySessionId(sessionId);
    
    // Ensure user can only access their own payments (or if they're an instructor/admin)
    if (payment.studentId !== userId && req.user!.role !== 'instructor' && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(payment);
  } catch (error: any) {
    console.error('Error getting payment status by session ID:', error);
    
    if (error.message === 'Payment not found') {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(500).json({
      error: 'Failed to get payment status'
    });
  }
});

/**
 * POST /api/payments/:paymentId/enroll
 * Enroll student after payment verification
 */
router.post('/:paymentId/enroll', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user!.userId;

    // First verify the payment belongs to the user
    const payment = await PaymentService.getPaymentStatus(paymentId);
    
    if (payment.studentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const enrollment = await PaymentService.enrollStudentAfterPayment(paymentId);
    
    res.status(201).json({ enrollment });
  } catch (error: any) {
    console.error('Error enrolling student after payment:', error);
    
    if (error.message === 'Payment not found') {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (error.message === 'Payment is not completed') {
      return res.status(402).json({ error: 'Payment is not completed' });
    }
    
    if (error.message === 'Course is not available for enrollment') {
      return res.status(404).json({ error: 'Course is not available for enrollment' });
    }

    res.status(500).json({
      error: 'Failed to enroll student'
    });
  }
});

export default router;