import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  School,
  Timer,
  Assignment,
  Quiz,
  Star,
  TrendingUp,
  EmojiEvents,
  Help,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Progress {
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  completedAssignments: number;
  totalAssignments: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageGrade: number;
  timeSpent: number;
  lastActivity: string;
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
  }[];
  recentActivities: {
    id: string;
    type: 'lesson' | 'assignment' | 'quiz';
    title: string;
    completedAt: string;
    grade?: number;
  }[];
  upcomingDeadlines: {
    id: string;
    type: 'assignment' | 'quiz';
    title: string;
    dueDate: string;
  }[];
}

const CourseProgress: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get(`/api/course/${id}/progress`);
        setProgress(response.data);
      } catch (err) {
        setError('Failed to fetch progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [id]);

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !progress) {
    return (
      <Container>
        <Alert severity="error">{error || 'Progress data not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Course Progress
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress.overallProgress}
          sx={{ height: 10, borderRadius: 5, mb: 2 }}
        />
        <Typography variant="body1" color="text.secondary">
          {progress.overallProgress}% Complete
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Progress Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Progress
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lessons Completed"
                    secondary={`${progress.completedLessons} of ${progress.totalLessons}`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={(progress.completedLessons / progress.totalLessons) * 100}
                    sx={{ width: 100 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Assignments Completed"
                    secondary={`${progress.completedAssignments} of ${progress.totalAssignments}`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={(progress.completedAssignments / progress.totalAssignments) * 100}
                    sx={{ width: 100 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Quiz />
                  </ListItemIcon>
                  <ListItemText
                    primary="Quizzes Completed"
                    secondary={`${progress.completedQuizzes} of ${progress.totalQuizzes}`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={(progress.completedQuizzes / progress.totalQuizzes) * 100}
                    sx={{ width: 100 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {progress.averageGrade}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Grade
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {formatTimeSpent(progress.timeSpent)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time Spent
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Activity: {formatDate(progress.lastActivity)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Activity</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Completed</TableCell>
                      <TableCell>Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {progress.recentActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.title}</TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              activity.type === 'lesson' ? <School /> :
                              activity.type === 'assignment' ? <Assignment /> :
                              <Quiz />
                            }
                            label={activity.type}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(activity.completedAt)}</TableCell>
                        <TableCell>
                          {activity.grade ? `${activity.grade}%` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Deadlines
              </Typography>
              <List>
                {progress.upcomingDeadlines.map((deadline) => (
                  <ListItem key={deadline.id}>
                    <ListItemIcon>
                      {deadline.type === 'assignment' ? <Assignment /> : <Quiz />}
                    </ListItemIcon>
                    <ListItemText
                      primary={deadline.title}
                      secondary={`Due: ${formatDate(deadline.dueDate)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Achievements
              </Typography>
              <Grid container spacing={2}>
                {progress.achievements.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <EmojiEvents color="primary" />
                      <Box>
                        <Typography variant="subtitle1">{achievement.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {achievement.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Earned: {formatDate(achievement.earnedAt)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseProgress; 