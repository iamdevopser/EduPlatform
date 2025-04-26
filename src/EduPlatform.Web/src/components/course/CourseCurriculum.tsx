import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Collapse,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  PlayCircleOutline,
  Lock,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  isCompleted: boolean;
  videoUrl?: string;
  description?: string;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

const CourseCurriculum: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const [curriculumResponse, enrollmentResponse] = await Promise.all([
          axios.get(`/api/course/${id}/curriculum`),
          user ? axios.get(`/api/course/${id}/enrollment-status`) : null,
        ]);

        setSections(
          curriculumResponse.data.sections.map((section: Section) => ({
            ...section,
            isExpanded: true,
          }))
        );
        if (enrollmentResponse) {
          setIsEnrolled(enrollmentResponse.data.isEnrolled);
        }
      } catch (err) {
        setError('Failed to fetch curriculum');
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [id, user]);

  const handleSectionToggle = (sectionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (!isEnrolled && !lesson.isPreview) {
      return;
    }
    // Navigate to lesson player or show preview
    console.log('Navigate to lesson:', lesson.id);
  };

  const getTotalDuration = () => {
    return sections.reduce((total, section) => {
      return (
        total +
        section.lessons.reduce((sectionTotal, lesson) => {
          const minutes = parseInt(lesson.duration);
          return sectionTotal + (isNaN(minutes) ? 0 : minutes);
        }, 0)
      );
    }, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Course Curriculum
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {sections.length} sections • {sections.reduce((total, section) => total + section.lessons.length, 0)} lessons
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Total duration: {formatDuration(getTotalDuration())}
          </Typography>
        </Box>
      </Box>

      <Paper>
        <List>
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={section.id}>
              <ListItem
                button
                onClick={() => handleSectionToggle(section.id)}
                sx={{ bgcolor: 'background.paper' }}
              >
                <ListItemIcon>
                  {section.isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        Section {sectionIndex + 1}: {section.title}
                      </Typography>
                      <Chip
                        label={`${section.lessons.length} lessons`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={section.description}
                />
              </ListItem>
              <Collapse in={section.isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.lessons.map((lesson) => (
                    <ListItem
                      key={lesson.id}
                      button
                      onClick={() => handleLessonClick(lesson)}
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
                              <Chip
                                label="Preview"
                                size="small"
                                color="secondary"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2">
                                {lesson.duration}
                              </Typography>
                            </Box>
                            {!isEnrolled && !lesson.isPreview && (
                              <Chip
                                icon={<Lock />}
                                label="Locked"
                                size="small"
                                color="default"
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
              {sectionIndex < sections.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default CourseCurriculum; 