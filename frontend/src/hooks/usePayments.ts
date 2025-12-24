import { useState } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface PaymentSession {
  sessionId: string;
  url: string;
}

export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentProvider: 'stripe' | 'paystack';
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    title: string;
    pricing: number;
    currency: string;
  };
  student: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const createCheckoutSession = async (
    courseId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<PaymentSession> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_URL}/payments/create-checkout`,
        {
          courseId,
          successUrl,
          cancelUrl,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create checkout session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = async (paymentId: string): Promise<Payment> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_URL}/payments/status/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to get payment status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCheckoutSession,
    getPaymentStatus,
  };
};