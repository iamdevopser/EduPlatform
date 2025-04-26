import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Assignment,
  Upload,
  Download,
  CheckCircle,
  Error,
  Description,
  AccessTime,
  Grade,
  Comment,
  AttachFile,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  instructions: string;
  attachments: {
    id: string;
    name: string;
    url: string;
    size: number;
  }[];
  submission?: {
    id: string;
    status: 'submitted' | 'graded';
    submittedAt: string;
    grade?: number;
    feedback?: string;
    files: {
      id: string;
      name: string;
      url: string;
      size: number;
    }[];
  };
}

const CourseAssignment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState('');
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`/api/course/${id}/assignment`);
        setAssignment(response.data);
      } catch (err) {
        setError('Failed to fetch assignment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const handleFileDelete = (index: number) => {
    setFileToDelete(files[index].name);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      setFiles(files.filter(file => file.name !== fileToDelete));
      setFileToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!assignment || files.length === 0) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('comment', comment);

      const response = await axios.post(`/api/course/${id}/assignment/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAssignment({
        ...assignment,
        submission: response.data,
      });
      setFiles([]);
      setComment('');
    } catch (err) {
      setError('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !assignment) {
    return (
      <Container>
        <Alert severity="error">{error || 'Assignment not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            {assignment.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccessTime color="primary" />
            <Typography variant="body1">
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </Typography>
            <Chip
              icon={<Grade />}
              label={`${assignment.points} points`}
              color="primary"
            />
          </Box>
        </Box>

        <Typography variant="body1" paragraph>
          {assignment.description}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <Typography variant="body1" paragraph>
            {assignment.instructions}
          </Typography>
        </Box>

        {assignment.attachments.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Assignment Files
            </Typography>
            <List>
              {assignment.attachments.map((file) => (
                <ListItem
                  key={file.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <AttachFile />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {assignment.submission ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Submission
            </Typography>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Submitted on {new Date(assignment.submission.submittedAt).toLocaleString()}
                  </Typography>
                  <Chip
                    icon={assignment.submission.status === 'graded' ? <CheckCircle /> : <AccessTime />}
                    label={assignment.submission.status === 'graded' ? 'Graded' : 'Submitted'}
                    color={assignment.submission.status === 'graded' ? 'success' : 'primary'}
                  />
                </Box>

                {assignment.submission.files.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Submitted Files
                    </Typography>
                    <List>
                      {assignment.submission.files.map((file) => (
                        <ListItem
                          key={file.id}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download />
                            </IconButton>
                          }
                        >
                          <ListItemIcon>
                            <AttachFile />
                          </ListItemIcon>
                          <ListItemText
                            primary={file.name}
                            secondary={formatFileSize(file.size)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {assignment.submission.status === 'graded' && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Grade
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {assignment.submission.grade} / {assignment.points}
                      </Typography>
                    </Box>
                    {assignment.submission.feedback && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Feedback
                        </Typography>
                        <Typography variant="body1">
                          {assignment.submission.feedback}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Submit Assignment
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  multiple
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="raised-button-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                  >
                    Upload Files
                  </Button>
                </label>
              </Box>

              {files.length > 0 && (
                <List>
                  {files.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleFileDelete(index)}>
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <AttachFile />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comments"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mt: 3 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || files.length === 0}
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {fileToDelete}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseAssignment; 