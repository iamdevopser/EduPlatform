import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
} from '@mui/material';
import {
  Send,
  MoreVert,
  Edit,
  Delete,
  Reply,
  AttachFile,
  ThumbUp,
  ThumbDown,
  Flag,
  Notifications,
  NotificationsOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DiscussionThread {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  replies: number;
  views: number;
  likes: number;
  dislikes: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface DiscussionReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  isAnswer: boolean;
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

const CourseDiscussion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  });
  const [newReply, setNewReply] = useState({
    content: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unanswered'>('latest');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await axios.get(`/api/course/${id}/discussions`, {
          params: { sortBy, filterTag },
        });
        setThreads(response.data);
      } catch (err) {
        setError('Failed to fetch discussion threads');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [id, sortBy, filterTag]);

  const handleThreadClick = async (thread: DiscussionThread) => {
    setSelectedThread(thread);
    try {
      const response = await axios.get(`/api/course/${id}/discussions/${thread.id}/replies`);
      setReplies(response.data);
    } catch (err) {
      setError('Failed to fetch thread replies');
    }
  };

  const handleCreateThread = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newThread.title);
      formData.append('content', newThread.content);
      formData.append('tags', JSON.stringify(newThread.tags));
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await axios.post(`/api/course/${id}/discussions`, formData);
      setThreads([response.data, ...threads]);
      setShowNewThreadDialog(false);
      setNewThread({ title: '', content: '', tags: [] });
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to create new thread');
    }
  };

  const handleReply = async () => {
    if (!selectedThread) return;

    try {
      const formData = new FormData();
      formData.append('content', newReply.content);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await axios.post(
        `/api/course/${id}/discussions/${selectedThread.id}/replies`,
        formData
      );
      setReplies([...replies, response.data]);
      setShowReplyDialog(false);
      setNewReply({ content: '' });
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to post reply');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleThreadAction = async (action: string, threadId: string) => {
    try {
      switch (action) {
        case 'pin':
          await axios.post(`/api/course/${id}/discussions/${threadId}/pin`);
          break;
        case 'lock':
          await axios.post(`/api/course/${id}/discussions/${threadId}/lock`);
          break;
        case 'delete':
          await axios.delete(`/api/course/${id}/discussions/${threadId}`);
          setThreads(threads.filter((t) => t.id !== threadId));
          break;
      }
    } catch (err) {
      setError(`Failed to ${action} thread`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !threads.length) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Course Discussions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Engage with your peers and instructors in course-related discussions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Threads List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Discussion Threads</Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowNewThreadDialog(true)}
                >
                  New Thread
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Chip
                  label="Latest"
                  onClick={() => setSortBy('latest')}
                  color={sortBy === 'latest' ? 'primary' : 'default'}
                  sx={{ mr: 1 }}
                />
                <Chip
                  label="Popular"
                  onClick={() => setSortBy('popular')}
                  color={sortBy === 'popular' ? 'primary' : 'default'}
                  sx={{ mr: 1 }}
                />
                <Chip
                  label="Unanswered"
                  onClick={() => setSortBy('unanswered')}
                  color={sortBy === 'unanswered' ? 'primary' : 'default'}
                />
              </Box>

              <List>
                {threads.map((thread) => (
                  <ListItem
                    key={thread.id}
                    button
                    selected={selectedThread?.id === thread.id}
                    onClick={() => handleThreadClick(thread)}
                  >
                    <ListItemAvatar>
                      <Avatar src={thread.author.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {thread.isPinned && (
                            <Chip
                              label="Pinned"
                              size="small"
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                          )}
                          {thread.isLocked && (
                            <Chip
                              label="Locked"
                              size="small"
                              color="error"
                              sx={{ mr: 1 }}
                            />
                          )}
                          <Typography variant="subtitle1">{thread.title}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {thread.author.name} • {new Date(thread.createdAt).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {thread.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                onClick={() => setFilterTag(tag)}
                                sx={{ mr: 1, mb: 1 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                          {thread.replies} replies
                        </Typography>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(e.currentTarget);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Thread Details */}
        <Grid item xs={12} md={8}>
          {selectedThread ? (
            <Card>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {selectedThread.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={selectedThread.author.avatar} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedThread.author.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(selectedThread.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    dangerouslySetInnerHTML={{ __html: selectedThread.content }}
                    sx={{ mb: 3 }}
                  />
                  {selectedThread.attachments.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments:
                      </Typography>
                      {selectedThread.attachments.map((file) => (
                        <Chip
                          key={file.id}
                          label={file.name}
                          onClick={() => window.open(file.url, '_blank')}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ThumbUp />}
                    >
                      {selectedThread.likes}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ThumbDown />}
                    >
                      {selectedThread.dislikes}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Reply />}
                      onClick={() => setShowReplyDialog(true)}
                    >
                      Reply
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Replies
                </Typography>
                <List>
                  {replies.map((reply) => (
                    <ListItem key={reply.id}>
                      <ListItemAvatar>
                        <Avatar src={reply.author.avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {reply.author.name}
                            </Typography>
                            {reply.isAnswer && (
                              <Chip
                                label="Answer"
                                size="small"
                                color="success"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </Typography>
                            <Box
                              dangerouslySetInnerHTML={{ __html: reply.content }}
                              sx={{ mt: 1 }}
                            />
                            {reply.attachments.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {reply.attachments.map((file) => (
                                  <Chip
                                    key={file.id}
                                    label={file.name}
                                    onClick={() => window.open(file.url, '_blank')}
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton>
                            <ThumbUp />
                          </IconButton>
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            {reply.likes}
                          </Typography>
                          <IconButton>
                            <ThumbDown />
                          </IconButton>
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            {reply.dislikes}
                          </Typography>
                          {user?.role === 'Instructor' && (
                            <IconButton>
                              <Flag />
                            </IconButton>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center">
                  Select a thread to view its details
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* New Thread Dialog */}
      <Dialog
        open={showNewThreadDialog}
        onClose={() => setShowNewThreadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Thread</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newThread.title}
            onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <ReactQuill
            value={newThread.content}
            onChange={(content) => setNewThread({ ...newThread, content })}
            style={{ height: '200px', marginBottom: '50px' }}
          />
          <input
            type="file"
            id="file-upload"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <Button
            component="label"
            htmlFor="file-upload"
            startIcon={<AttachFile />}
            sx={{ mb: 2 }}
          >
            Attach File
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewThreadDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateThread} variant="contained">
            Create Thread
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog
        open={showReplyDialog}
        onClose={() => setShowReplyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Reply to Thread</DialogTitle>
        <DialogContent>
          <ReactQuill
            value={newReply.content}
            onChange={(content) => setNewReply({ ...newReply, content })}
            style={{ height: '200px', marginBottom: '50px' }}
          />
          <input
            type="file"
            id="reply-file-upload"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <Button
            component="label"
            htmlFor="reply-file-upload"
            startIcon={<AttachFile />}
            sx={{ mb: 2 }}
          >
            Attach File
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReplyDialog(false)}>Cancel</Button>
          <Button onClick={handleReply} variant="contained">
            Post Reply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thread Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {user?.role === 'Instructor' && (
          <>
            <MenuItem onClick={() => {
              handleThreadAction('pin', selectedThread?.id || '');
              setAnchorEl(null);
            }}>
              {selectedThread?.isPinned ? 'Unpin Thread' : 'Pin Thread'}
            </MenuItem>
            <MenuItem onClick={() => {
              handleThreadAction('lock', selectedThread?.id || '');
              setAnchorEl(null);
            }}>
              {selectedThread?.isLocked ? 'Unlock Thread' : 'Lock Thread'}
            </MenuItem>
            <MenuItem onClick={() => {
              handleThreadAction('delete', selectedThread?.id || '');
              setAnchorEl(null);
            }}>
              Delete Thread
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Notifications /> Subscribe
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default CourseDiscussion; 