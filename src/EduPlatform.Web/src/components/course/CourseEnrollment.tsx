import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  Payment,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Course {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  currency: string;
  includes: string[];
  requirements: string[];
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  lastFour?: string;
  bankName?: string;
  walletType?: string;
}

const CourseEnrollment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseResponse, paymentMethodsResponse] = await Promise.all([
          axios.get(`/api/course/${id}`),
          user ? axios.get('/api/user/payment-methods') : null,
        ]);

        setCourse(courseResponse.data);
        if (paymentMethodsResponse) {
          setPaymentMethods(paymentMethodsResponse.data);
        }
      } catch (err) {
        setError('Failed to fetch course information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponError(null);
    try {
      const response = await axios.post(`/api/course/${id}/apply-coupon`, {
        code: couponCode,
      });
      setCourse(response.data);
    } catch (err) {
      setCouponError('Invalid or expired coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;

    setProcessingPayment(true);
    try {
      await axios.post(`/api/course/${id}/enroll`, {
        paymentMethodId: selectedPaymentMethod,
      });
      navigate(`/course/${id}/learn`);
    } catch (err) {
      setError('Payment failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  const getSteps = () => {
    return ['Review Course', 'Payment Method', 'Complete Enrollment'];
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Course Details
            </Typography>
            <Typography variant="body1" paragraph>
              {course?.title}
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                What's Included
              </Typography>
              {course?.includes.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography>{item}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Requirements
              </Typography>
              {course?.requirements.map((item, index) => (
                <Typography key={index} paragraph>
                  • {item}
                </Typography>
              ))}
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Payment Method
            </Typography>
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <Paper key={method.id} sx={{ p: 2, mb: 2 }}>
                  <FormControlLabel
                    value={method.id}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {method.type === 'card' && <CreditCard sx={{ mr: 1 }} />}
                        {method.type === 'bank' && <AccountBalance sx={{ mr: 1 }} />}
                        {method.type === 'wallet' && <Payment sx={{ mr: 1 }} />}
                        <Typography>
                          {method.type === 'card' && `Card ending in ${method.lastFour}`}
                          {method.type === 'bank' && method.bankName}
                          {method.type === 'wallet' && method.walletType}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              ))}
            </RadioGroup>
            <Button
              variant="outlined"
              startIcon={<Payment />}
              onClick={() => navigate('/payment-methods')}
            >
              Add New Payment Method
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Complete Enrollment
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Course Price</Typography>
                  <Typography>
                    {course?.currency} {course?.price.toFixed(2)}
                  </Typography>
                </Box>
                {course?.discountPrice && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Discount</Typography>
                    <Typography color="success.main">
                      -{course?.currency} {(course.price - course.discountPrice).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="subtitle1">
                    {course?.currency} {(course?.discountPrice || course?.price).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Apply Coupon Code
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  error={!!couponError}
                  helperText={couponError}
                />
                <Button
                  variant="outlined"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Container>
        <Alert severity="error">{error || 'Course not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {getSteps().map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3 }}>
        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep === getSteps().length - 1 ? (
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={!selectedPaymentMethod || processingPayment}
            >
              {processingPayment ? 'Processing...' : 'Complete Enrollment'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CourseEnrollment; 