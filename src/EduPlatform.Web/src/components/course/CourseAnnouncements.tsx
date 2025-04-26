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
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Announcement,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  isImportant: boolean;
  tags: string[];
}

const CourseAnnouncements: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    isImportant: false,
    tags: [] as string[],
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [id]);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`/api/course/${id}/announcements`);
      setAnnouncements(response.data);
    } catch (err) {
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      await axios.post(`/api/course/${id}/announcements`, newAnnouncement);
      setShowCreateDialog(false);
      setNewAnnouncement({
        title: '',
        content: '',
        isImportant: false,
        tags: [],
      });
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to create announcement');
    }
  };

  const handleEditAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      await axios.put(`/api/course/${id}/announcements/${selectedAnnouncement.id}`, selectedAnnouncement);
      setShowEditDialog(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await axios.delete(`/api/course/${id}/announcements/${announcementId}`);
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to delete announcement');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
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
    if (selectedAnnouncement) {
      handleDeleteAnnouncement(selectedAnnouncement.id);
    }
    handleMenuClose();
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
          Course Announcements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay updated with the latest course information and important notices
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
            Create Announcement
          </Button>
        </Box>
      )}

      <List>
        {announcements.map((announcement) => (
          <React.Fragment key={announcement.id}>
            <Card sx={{ mb: 2 }}>
              <CardHeader
                avatar={<Announcement color={announcement.isImportant ? 'error' : 'primary'} />}
                title={announcement.title}
                subheader={`${announcement.author.name} • ${new Date(announcement.createdAt).toLocaleDateString()}`}
                action={
                  user?.role === 'Instructor' && (
                    <IconButton onClick={(e) => handleMenuClick(e, announcement)}>
                      <MoreVert />
                    </IconButton>
                  )
                }
              />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {announcement.content}
                </Typography>
                {announcement.tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {announcement.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </React.Fragment>
        ))}
      </List>

      {/* Create Announcement Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Announcement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={newAnnouncement.tags.join(', ')}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, tags: e.target.value.split(',').map(tag => tag.trim()) })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAnnouncement} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Announcement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={selectedAnnouncement?.title}
            onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement!, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            value={selectedAnnouncement?.content}
            onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement!, content: e.target.value })}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={selectedAnnouncement?.tags.join(', ')}
            onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement!, tags: e.target.value.split(',').map(tag => tag.trim()) })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditAnnouncement} variant="contained">
            Save
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

export default CourseAnnouncements; 