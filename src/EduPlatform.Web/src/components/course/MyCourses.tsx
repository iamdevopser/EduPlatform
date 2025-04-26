import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  instructorName: string;
  thumbnailUrl: string;
  progress: number;
  lastAccessed: string;
  status: 'In Progress' | 'Completed';
}

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await axios.get('/api/course/enrolled');
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch enrolled courses');
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Loading your courses...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h4" color="error" gutterBottom>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        My Courses
      </Typography>
      {courses.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            You haven't enrolled in any courses yet
          </Typography>
          <Button
            component={Link}
            to="/courses"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Browse Courses
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={course.thumbnailUrl}
                  alt={course.title}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Instructor: {course.instructorName}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="textSecondary" align="right">
                      {course.progress}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={course.status}
                      color={course.status === 'Completed' ? 'success' : 'primary'}
                      size="small"
                    />
                    <Button
                      component={Link}
                      to={`/course/${course.id}`}
                      variant="contained"
                      color="primary"
                      size="small"
                    >
                      Continue Learning
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyCourses; 