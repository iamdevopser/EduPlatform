import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
    courseId: string;
    amount: number;
    currency: string;
    onSuccess: () => void;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({ courseId, amount, currency, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError('');

        try {
            // Create payment intent
            const { data: { clientSecret } } = await axios.post('/api/payment/create-intent', {
                courseId
            });

            // Confirm payment
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                }
            });

            if (stripeError) {
                setError(stripeError.message!);
            } else if (paymentIntent.status === 'succeeded') {
                // Confirm payment on our backend
                await axios.post('/api/payment/confirm', {
                    paymentIntentId: paymentIntent.id
                });
                onSuccess();
            }
        } catch (err) {
            setError('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            <div className="mb-6">
                <div className="text-lg mb-4">
                    Amount: {amount} {currency.toUpperCase()}
                </div>
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
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none disabled:bg-gray-400"
            >
                {processing ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentFormContent {...props} />
        </Elements>
    );
};

export default PaymentForm; 