# Payment System Documentation

## Overview

The payment system integrates with Stripe to handle course payments. It supports creating checkout sessions, processing webhooks, and tracking payment status.

## Environment Variables Required

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## API Endpoints

### Create Checkout Session
`POST /api/payments/create-checkout`

Creates a Stripe checkout session for course payment.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "courseId": "course_id",
  "successUrl": "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:3000/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### Webhook Handler
`POST /api/payments/webhook`

Handles Stripe webhook events. Automatically processes:
- `checkout.session.completed` - Creates enrollment after successful payment
- `payment_intent.payment_failed` - Updates payment status to failed

**Headers:**
- `stripe-signature: <webhook_signature>`

### Get Payment Status
`GET /api/payments/status/:paymentId`

Returns payment details by payment ID.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "id": "payment_id",
  "amount": 99.99,
  "currency": "USD",
  "status": "completed",
  "course": {
    "id": "course_id",
    "title": "Course Title"
  },
  "student": {
    "id": "student_id",
    "email": "student@example.com"
  }
}
```

### Get Payment Status by Session ID
`GET /api/payments/session/:sessionId`

Returns payment details by Stripe session ID.

## Payment Flow

1. Student clicks "Enroll" on a paid course
2. Frontend calls `POST /api/payments/create-checkout`
3. Backend creates Stripe checkout session and payment record
4. Student is redirected to Stripe checkout
5. After successful payment, Stripe sends webhook to `POST /api/payments/webhook`
6. Backend processes webhook, updates payment status, and creates enrollment
7. Student gains access to course content

## Error Handling

- **Course not found**: 404 error
- **Free course**: 400 error (cannot create payment for free courses)
- **Already enrolled**: 409 error
- **Payment failed**: Payment status updated to "failed"
- **Webhook verification failed**: 400 error

## Testing

The payment system includes comprehensive tests:
- Unit tests for PaymentService methods
- Integration tests for API endpoints
- Property-based tests for payment workflows

Run tests with:
```bash
npm test -- --testPathPatterns=payment
```