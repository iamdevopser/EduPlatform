import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider
} from '@mui/material';

interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  isSuccessful: boolean;
  paidAt: string;
  stripeIntentId: string;
  courseTitle: string;
  courseId: string;
  invoiceId?: string;
}

const PaymentDetails: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await axios.get(`/api/payments/history/${paymentId}`);
        setPayment(response.data);
      } catch (err) {
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await axios.get(`/api/invoices/${payment.invoiceId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${payment.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Failed to download invoice');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error || !payment) {
    return <Typography color="error">{error || 'Payment not found'}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payment Details
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Course Information
            </Typography>
            <Typography>Course: {payment.courseTitle}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/courses/${payment.courseId}`)}
              sx={{ mt: 2 }}
            >
              View Course
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Typography>Amount: {formatCurrency(payment.amount, payment.currency)}</Typography>
            <Typography>Status: {payment.isSuccessful ? 'Successful' : 'Failed'}</Typography>
            <Typography>Date: {formatDate(payment.paidAt)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Transaction Details
            </Typography>
            <Typography>Transaction ID: {payment.stripeIntentId}</Typography>
            <Typography>Payment ID: {payment.id}</Typography>
            {payment.invoiceId && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadInvoice}
                sx={{ mt: 2 }}
              >
                Download Invoice
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Button
        variant="outlined"
        onClick={() => navigate('/payments/history')}
        sx={{ mt: 3 }}
      >
        Back to Payment History
      </Button>
    </Box>
  );
};

export default PaymentDetails; 