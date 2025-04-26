import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  Menu,
  PlayCircleOutline,
  CheckCircle,
  Lock,
  ArrowBack,
  ArrowForward,
  Bookmark,
  Note,
  QuestionAnswer,
  Download,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isPreview: boolean;
  videoUrl?: string;
  content?: string;
  resources?: {
    id: string;
    title: string;
    type: string;
    url: string;
  }[];
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  isCompleted: boolean;
}

const CourseLearning: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTakingNotes, setIsTakingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const response = await axios.get(`/api/course/${id}/content`);
        setSections(response.data.sections);
        setCurrentLesson(response.data.currentLesson);
        setProgress(response.data.progress);
      } catch (err) {
        setError('Failed to fetch course content');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [id]);

  const handleLessonClick = async (lesson: Lesson) => {
    try {
      const response = await axios.get(`/api/course/${id}/lesson/${lesson.id}`);
      setCurrentLesson(response.data);
      setDrawerOpen(false);
    } catch (err) {
      setError('Failed to load lesson');
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson) return;

    try {
      await axios.post(`/api/course/${id}/lesson/${currentLesson.id}/complete`);
      setSections(sections.map(section => ({
        ...section,
        lessons: section.lessons.map(lesson =>
          lesson.id === currentLesson.id
            ? { ...lesson, isCompleted: true }
            : lesson
        ),
        isCompleted: section.lessons.every(lesson => 
          lesson.id === currentLesson.id ? true : lesson.isCompleted
        ),
      })));
      setCurrentLesson({ ...currentLesson, isCompleted: true });
      // Update progress
      const totalLessons = sections.reduce((total, section) => total + section.lessons.length, 0);
      const completedLessons = sections.reduce((total, section) => 
        total + section.lessons.filter(lesson => lesson.isCompleted).length, 0
      ) + 1;
      setProgress((completedLessons / totalLessons) * 100);
    } catch (err) {
      setError('Failed to mark lesson as completed');
    }
  };

  const handleNextLesson = () => {
    // Find the next lesson in the course
    let foundCurrent = false;
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (foundCurrent) {
          handleLessonClick(lesson);
          return;
        }
        if (lesson.id === currentLesson?.id) {
          foundCurrent = true;
        }
      }
    }
  };

  const handlePreviousLesson = () => {
    // Find the previous lesson in the course
    let previousLesson: Lesson | null = null;
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (lesson.id === currentLesson?.id) {
          if (previousLesson) {
            handleLessonClick(previousLesson);
          }
          return;
        }
        previousLesson = lesson;
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!currentLesson) return;

    try {
      await axios.post(`/api/course/${id}/lesson/${currentLesson.id}/notes`, {
        content: notes,
      });
      setIsTakingNotes(false);
    } catch (err) {
      setError('Failed to save notes');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Course Content Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Course Content</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}% Complete
          </Typography>
        </Box>
        <Divider />
        <List>
          {sections.map((section) => (
            <React.Fragment key={section.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{section.title}</Typography>
                      {section.isCompleted && (
                        <CheckCircle color="success" fontSize="small" />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {section.lessons.map((lesson) => (
                <ListItem
                  key={lesson.id}
                  button
                  onClick={() => handleLessonClick(lesson)}
                  selected={currentLesson?.id === lesson.id}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    {lesson.isCompleted ? (
                      <CheckCircle color="success" />
                    ) : (
                      <PlayCircleOutline />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{lesson.title}</Typography>
                        {lesson.isPreview && (
                          <Chip label="Preview" size="small" color="secondary" />
                        )}
                      </Box>
                    }
                    secondary={lesson.duration}
                  />
                </ListItem>
              ))}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <Menu />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {currentLesson?.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Previous Lesson">
              <IconButton onClick={handlePreviousLesson}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Tooltip title="Next Lesson">
              <IconButton onClick={handleNextLesson}>
                <ArrowForward />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bookmark">
              <IconButton>
                <Bookmark />
              </IconButton>
            </Tooltip>
            <Tooltip title="Take Notes">
              <IconButton onClick={() => setIsTakingNotes(true)}>
                <Note />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ask Question">
              <IconButton>
                <QuestionAnswer />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          {currentLesson?.videoUrl && (
            <Box sx={{ mb: 3 }}>
              <video
                controls
                style={{ width: '100%', maxHeight: '60vh' }}
                src={currentLesson.videoUrl}
              />
            </Box>
          )}
          {currentLesson?.content && (
            <Typography variant="body1" paragraph>
              {currentLesson.content}
            </Typography>
          )}
          {currentLesson?.resources && currentLesson.resources.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resources
              </Typography>
              <Grid container spacing={2}>
                {currentLesson.resources.map((resource) => (
                  <Grid item xs={12} sm={6} md={4} key={resource.id}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Download />
                        <Typography variant="subtitle1">{resource.title}</Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: 1 }}
                      >
                        Download
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handlePreviousLesson}
            >
              Previous Lesson
            </Button>
            {!currentLesson?.isCompleted && (
              <Button
                variant="contained"
                onClick={handleCompleteLesson}
              >
                Mark as Complete
              </Button>
            )}
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={handleNextLesson}
            >
              Next Lesson
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Notes Dialog */}
      {isTakingNotes && (
        <Paper
          sx={{
            position: 'fixed',
            right: 20,
            top: 20,
            width: 300,
            p: 2,
            zIndex: 1000,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setIsTakingNotes(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveNotes}>
              Save
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CourseLearning; 