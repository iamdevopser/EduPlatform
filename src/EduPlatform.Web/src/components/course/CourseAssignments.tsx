import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Assignment,
  Upload,
  Download,
  CheckCircle,
  Pending,
  Grade,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  submissions: {
    id: string;
    studentId: string;
    studentName: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
    status: 'submitted' | 'graded' | 'late';
  }[];
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

const CourseAssignments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Assignment['submissions'][0] | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100,
    attachments: [] as File[],
  });
  const [gradingData, setGradingData] = useState({
    grade: 0,
    feedback: '',
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchAssignments();
  }, [id]);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`/api/course/${id}/assignments`);
      setAssignments(response.data);
    } catch (err) {
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('dueDate', newAssignment.dueDate);
      formData.append('totalPoints', newAssignment.totalPoints.toString());
      newAssignment.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      await axios.post(`/api/course/${id}/assignments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowCreateDialog(false);
      setNewAssignment({
        title: '',
        description: '',
        dueDate: '',
        totalPoints: 100,
        attachments: [],
      });
      fetchAssignments();
    } catch (err) {
      setError('Failed to create assignment');
    }
  };

  const handleEditAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      await axios.put(`/api/course/${id}/assignments/${selectedAssignment.id}`, selectedAssignment);
      setShowEditDialog(false);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      setError('Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await axios.delete(`/api/course/${id}/assignments/${assignmentId}`);
      fetchAssignments();
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !selectedAssignment) return;

    try {
      await axios.post(`/api/course/${id}/assignments/${selectedAssignment.id}/submissions/${selectedSubmission.id}/grade`, gradingData);
      setShowGradeDialog(false);
      setSelectedSubmission(null);
      setGradingData({ grade: 0, feedback: '' });
      fetchAssignments();
    } catch (err) {
      setError('Failed to grade submission');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setNewAssignment({
        ...newAssignment,
        attachments: Array.from(event.target.files),
      });
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setShowEditDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedAssignment) {
      handleDeleteAssignment(selectedAssignment.id);
    }
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSubmissionStatus = (submission: Assignment['submissions'][0]) => {
    if (submission.status === 'graded') {
      return <CheckCircle color="success" />;
    } else if (submission.status === 'late') {
      return <Pending color="warning" />;
    }
    return <Pending color="action" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Course Assignments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and submit course assignments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {user?.role === 'Instructor' && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
          >
            Create Assignment
          </Button>
        </Box>
      )}

      <List>
        {assignments.map((assignment) => (
          <React.Fragment key={assignment.id}>
            <Card sx={{ mb: 2 }}>
              <CardHeader
                avatar={<Assignment color="primary" />}
                title={assignment.title}
                subheader={`Due: ${formatDate(assignment.dueDate)} • ${assignment.totalPoints} points`}
                action={
                  user?.role === 'Instructor' && (
                    <IconButton onClick={(e) => handleMenuClick(e, assignment)}>
                      <MoreVert />
                    </IconButton>
                  )
                }
              />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {assignment.description}
                </Typography>

                {assignment.attachments.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Attachments:
                    </Typography>
                    <Grid container spacing={1}>
                      {assignment.attachments.map((attachment) => (
                        <Grid item key={attachment.id}>
                          <Chip
                            icon={<Download />}
                            label={attachment.name}
                            onClick={() => window.open(attachment.url, '_blank')}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {user?.role === 'Instructor' && assignment.submissions.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Submissions:
                    </Typography>
                    <List>
                      {assignment.submissions.map((submission) => (
                        <ListItem key={submission.id}>
                          <ListItemText
                            primary={submission.studentName}
                            secondary={`Submitted: ${formatDate(submission.submittedAt)}`}
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getSubmissionStatus(submission)}
                              {submission.grade && (
                                <Typography variant="body2">
                                  {submission.grade}/{assignment.totalPoints}
                                </Typography>
                              )}
                              <IconButton
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setSelectedSubmission(submission);
                                  setShowGradeDialog(true);
                                }}
                              >
                                <Grade />
                              </IconButton>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {user?.role === 'Student' && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Upload />}
                      component="label"
                    >
                      Submit Assignment
                      <input
                        type="file"
                        hidden
                        onChange={(e) => {
                          if (e.target.files) {
                            // Handle file submission
                          }
                        }}
                      />
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </React.Fragment>
        ))}
      </List>

      {/* Create Assignment Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newAssignment.title}
            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newAssignment.description}
            onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="datetime-local"
            value={newAssignment.dueDate}
            onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Total Points"
            type="number"
            value={newAssignment.totalPoints}
            onChange={(e) => setNewAssignment({ ...newAssignment, totalPoints: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload />}
            sx={{ mb: 2 }}
          >
            Upload Attachments
            <input
              type="file"
              hidden
              multiple
              onChange={handleFileUpload}
            />
          </Button>
          {newAssignment.attachments.length > 0 && (
            <Box>
              {newAssignment.attachments.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => {
                    setNewAssignment({
                      ...newAssignment,
                      attachments: newAssignment.attachments.filter((_, i) => i !== index),
                    });
                  }}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAssignment} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Assignment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={selectedAssignment?.title}
            onChange={(e) => setSelectedAssignment({ ...selectedAssignment!, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={selectedAssignment?.description}
            onChange={(e) => setSelectedAssignment({ ...selectedAssignment!, description: e.target.value })}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="datetime-local"
            value={selectedAssignment?.dueDate}
            onChange={(e) => setSelectedAssignment({ ...selectedAssignment!, dueDate: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Total Points"
            type="number"
            value={selectedAssignment?.totalPoints}
            onChange={(e) => setSelectedAssignment({ ...selectedAssignment!, totalPoints: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditAssignment} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog
        open={showGradeDialog}
        onClose={() => setShowGradeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Grade"
            type="number"
            value={gradingData.grade}
            onChange={(e) => setGradingData({ ...gradingData, grade: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Feedback"
            value={gradingData.feedback}
            onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGradeDialog(false)}>Cancel</Button>
          <Button onClick={handleGradeSubmission} variant="contained">
            Submit Grade
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default CourseAssignments; 