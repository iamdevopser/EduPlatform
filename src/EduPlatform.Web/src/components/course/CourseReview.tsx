import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Rating,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  isInstructor: boolean;
}

const CourseReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/course/${id}/reviews`);
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
      } catch (err) {
        setError('Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!newReview.rating || !newReview.comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/course/${id}/reviews`, newReview);
      setReviews([response.data, ...reviews]);
      setNewReview({ rating: 0, comment: '' });
      // Update average rating
      const newAverage = reviews.reduce((acc, review) => acc + review.rating, newReview.rating) / (reviews.length + 1);
      setAverageRating(newAverage);
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Course Reviews
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={averageRating} precision={0.5} readOnly size="large" />
          <Typography variant="h6" sx={{ ml: 1 }}>
            {averageRating.toFixed(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({reviews.length} reviews)
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {user && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Write a Review
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Your Rating</Typography>
            <Rating
              value={newReview.rating}
              onChange={(event, newValue) => {
                setNewReview({ ...newReview, rating: newValue || 0 });
              }}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review"
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!newReview.rating || !newReview.comment.trim() || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Paper>
      )}

      <Grid container spacing={3}>
        {reviews.map((review) => (
          <Grid item xs={12} key={review.id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={review.userAvatar} sx={{ mr: 2 }}>
                  {review.userName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{review.userName}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={review.rating} readOnly size="small" />
                    {review.isInstructor && (
                      <Chip
                        label="Instructor"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 'auto' }}
                >
                  {formatDate(review.createdAt)}
                </Typography>
              </Box>
              <Typography>{review.comment}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CourseReview; 