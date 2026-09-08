'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { paymentsApi } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '');

interface Props {
  orderId: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function PaymentFormContent({ orderId, amount, onSuccess, onError }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { clientSecret, paymentIntentId } = await paymentsApi.createPaymentIntent(
          orderId,
          amount,
        );
        setClientSecret(clientSecret);
      } catch (err) {
        setMessage('Error creating payment intent');
        onError('Error creating payment intent');
      }
    };

    createPaymentIntent();
  }, [orderId, amount, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (error) {
      setMessage(error.message || 'Payment failed');
      onError(error.message || 'Payment failed');
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment successful!');
      onSuccess(paymentIntent.id);
    } else if (paymentIntent && paymentIntent.status === 'requires_action') {
      setMessage('Additional verification required');
    } else {
      setMessage('Unexpected payment status');
      onError('Unexpected payment status');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('successful')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !elements || !clientSecret}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando pago...' : `Pagar $${(amount / 100).toFixed(2)}`}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Powered by Stripe. Your payment information is secure.
      </p>
    </form>
  );
}

export default function StripePaymentForm(props: Props) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}
