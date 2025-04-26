import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  Divider,
  Rating,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PlayCircleOutline,
  AccessTime,
  People,
  Star,
  Description,
  School,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import CourseReview from './CourseReview';
import CourseDiscussion from './CourseDiscussion';
import CourseResources from './CourseResources';
import CourseCurriculum from './CourseCurriculum';
import CourseInstructor from './CourseInstructor';
import CourseProgress from './CourseProgress';
import CourseAnalytics from './CourseAnalytics';
import CourseSettings from './CourseSettings';
import CourseCertificate from './CourseCertificate';
import CourseAnnouncements from './CourseAnnouncements';
import CourseAssignments from './CourseAssignments';

interface Course {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  instructorBio: string;
  price: number;
  rating: number;
  totalStudents: number;
  totalLessons: number;
  totalDuration: string;
  thumbnailUrl: string;
  category: string;
  level: string;
  requirements: string[];
  whatYouWillLearn: string[];
  curriculum: {
    sectionTitle: string;
    lessons: {
      title: string;
      duration: string;
      isPreview: boolean;
    }[];
  }[];
  enrollmentStatus: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const isInstructor = user?.role === 'Instructor';
  const isEnrolled = course?.enrollmentStatus === 'Enrolled';

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const [courseResponse, enrollmentResponse] = await Promise.all([
          axios.get(`/api/course/${id}`),
          isAuthenticated ? axios.get(`/api/course/${id}/enrollment-status`) : null,
        ]);

        setCourse(courseResponse.data);
        if (enrollmentResponse) {
          setTabValue(enrollmentResponse.data.isEnrolled ? 0 : 1);
        }
      } catch (err) {
        setError('Failed to fetch course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, isAuthenticated]);

  const handleEnroll = () => {
    navigate(`/course/${id}/enroll`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {course.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={course.rating} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({course.rating.toFixed(1)})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {course.totalStudents} students
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip label={course.level} color="primary" size="small" />
            <Chip label={course.category} color="secondary" size="small" />
          </Box>

          <CardMedia
            component="img"
            height="400"
            image={course.thumbnailUrl}
            alt={course.title}
            sx={{ borderRadius: 1, mb: 3 }}
          />

          <Paper sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab label="Overview" />
                <Tab label="Curriculum" />
                <Tab label="Instructor" />
                <Tab label="Reviews" />
                <Tab label="Progress" />
                <Tab label="Discussions" />
                <Tab label="Resources" />
                <Tab label="Announcements" />
                <Tab label="Assignments" />
                {(isInstructor || isEnrolled) && <Tab label="Certificate" />}
                {isInstructor && <Tab label="Analytics" />}
                {isInstructor && <Tab label="Settings" />}
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                About This Course
              </Typography>
              <Typography paragraph>{course.description}</Typography>

              <Typography variant="h6" gutterBottom>
                What You'll Learn
              </Typography>
              <Grid container spacing={2}>
                {course.whatYouWillLearn.map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <School sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography>{item}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Requirements
              </Typography>
              <ul>
                {course.requirements.map((req, index) => (
                  <li key={index}>
                    <Typography>{req}</Typography>
                  </li>
                ))}
              </ul>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <CourseCurriculum />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <CourseInstructor />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <CourseReview />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <CourseProgress />
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <CourseDiscussion />
            </TabPanel>

            <TabPanel value={tabValue} index={6}>
              <CourseResources />
            </TabPanel>

            <TabPanel value={tabValue} index={7}>
              <CourseAnnouncements />
            </TabPanel>

            <TabPanel value={tabValue} index={8}>
              <CourseAssignments />
            </TabPanel>

            {(isInstructor || isEnrolled) && (
              <TabPanel value={tabValue} index={9}>
                <CourseCertificate />
              </TabPanel>
            )}

            {isInstructor && (
              <TabPanel value={tabValue} index={10}>
                <CourseAnalytics />
              </TabPanel>
            )}

            {isInstructor && (
              <TabPanel value={tabValue} index={11}>
                <CourseSettings />
              </TabPanel>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                ${course.price.toFixed(2)}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{course.totalDuration} total</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PlayCircleOutline sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{course.totalLessons} lessons</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{course.totalStudents} students</Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleEnroll}
                disabled={isEnrolled}
              >
                {isEnrolled ? 'Go to Course' : 'Enroll Now'}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                30-day money-back guarantee
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseDetails; 