import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Timer,
  Assignment,
  Quiz,
  EmojiEvents,
  BarChart,
  LineChart,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Analytics {
  enrollmentStats: {
    totalEnrollments: number;
    activeStudents: number;
    completionRate: number;
    averageTimeToComplete: number;
  };
  engagementMetrics: {
    averageTimeSpent: number;
    assignmentSubmissionRate: number;
    quizCompletionRate: number;
    discussionParticipation: number;
  };
  performanceMetrics: {
    averageGrade: number;
    passRate: number;
    topPerformingStudents: {
      id: string;
      name: string;
      grade: number;
      completedAt: string;
    }[];
  };
  revenueStats: {
    totalRevenue: number;
    monthlyRevenue: number;
    refundRate: number;
  };
  studentFeedback: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      rating: number;
      count: number;
    }[];
  };
}

const CourseAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`/api/course/${id}/analytics`);
        setAnalytics(response.data);
      } catch (err) {
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !analytics) {
    return (
      <Container>
        <Alert severity="error">{error || 'Analytics data not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Course Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Detailed insights about your course performance and student engagement
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Enrollment Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enrollment Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4">{analytics.enrollmentStats.totalEnrollments}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Enrollments</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">{analytics.enrollmentStats.activeStudents}</Typography>
                  <Typography variant="body2" color="text.secondary">Active Students</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">{analytics.enrollmentStats.completionRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">
                    {formatTime(analytics.enrollmentStats.averageTimeToComplete)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg. Time to Complete</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Engagement Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Engagement Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4">{formatTime(analytics.engagementMetrics.averageTimeSpent)}</Typography>
                  <Typography variant="body2" color="text.secondary">Avg. Time Spent</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">{analytics.engagementMetrics.assignmentSubmissionRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Assignment Submission Rate</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">{analytics.engagementMetrics.quizCompletionRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Quiz Completion Rate</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">{analytics.engagementMetrics.discussionParticipation}%</Typography>
                  <Typography variant="body2" color="text.secondary">Discussion Participation</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="h4">{analytics.performanceMetrics.averageGrade}%</Typography>
                  <Typography variant="body2" color="text.secondary">Average Grade</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h4">{analytics.performanceMetrics.passRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Pass Rate</Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Top Performing Students
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Completed</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.performanceMetrics.topPerformingStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.grade}%</TableCell>
                          <TableCell>{new Date(student.completedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4">{formatCurrency(analytics.revenueStats.totalRevenue)}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">{formatCurrency(analytics.revenueStats.monthlyRevenue)}</Typography>
                  <Typography variant="body2" color="text.secondary">Monthly Revenue</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">{analytics.revenueStats.refundRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Refund Rate</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Student Feedback */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Student Feedback
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4">{analytics.studentFeedback.averageRating.toFixed(1)}</Typography>
                  <Typography variant="body2" color="text.secondary">Average Rating</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4">{analytics.studentFeedback.totalReviews}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Reviews</Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Rating Distribution
                </Typography>
                {analytics.studentFeedback.ratingDistribution.map((dist) => (
                  <Box key={dist.rating} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ width: 30 }}>{dist.rating}★</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(dist.count / analytics.studentFeedback.totalReviews) * 100}
                        sx={{ flexGrow: 1, mx: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary">{dist.count}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseAnalytics; 