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
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Folder,
  InsertDriveFile,
  Image,
  VideoLibrary,
  AudioFile,
  Code,
  Description,
  MoreVert,
  Download,
  Delete,
  Edit,
  Add,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Resource {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string;
  size?: number;
  url?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
  description?: string;
}

const CourseResources: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, [id, currentFolder]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`/api/course/${id}/resources`, {
        params: { folderId: currentFolder },
      });
      setResources(response.data);
    } catch (err) {
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folderId', currentFolder || '');

      await axios.post(`/api/course/${id}/resources/upload`, formData);
      setShowUploadDialog(false);
      setSelectedFile(null);
      fetchResources();
    } catch (err) {
      setError('Failed to upload file');
    }
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post(`/api/course/${id}/resources/folders`, {
        ...newFolder,
        parentId: currentFolder,
      });
      setShowCreateFolderDialog(false);
      setNewFolder({ name: '', description: '' });
      fetchResources();
    } catch (err) {
      setError('Failed to create folder');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await axios.delete(`/api/course/${id}/resources/${resourceId}`);
      fetchResources();
    } catch (err) {
      setError('Failed to delete resource');
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image />;
      case 'video':
        return <VideoLibrary />;
      case 'audio':
        return <AudioFile />;
      case 'code':
        return <Code />;
      case 'document':
        return <Description />;
      default:
        return <InsertDriveFile />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || 
      (filterType === 'folder' && resource.type === 'folder') ||
      (filterType === 'file' && resource.type === 'file');
    return matchesSearch && matchesType;
  });

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
          Course Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access and manage course materials and resources
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1 }} />,
                    }}
                  />
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filterType}
                      label="Type"
                      onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="file">Files</MenuItem>
                      <MenuItem value="folder">Folders</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {user?.role === 'Instructor' && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setShowUploadDialog(true)}
                    >
                      Upload File
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Folder />}
                      onClick={() => setShowCreateFolderDialog(true)}
                    >
                      New Folder
                    </Button>
                  </Box>
                )}
              </Box>

              <List>
                {filteredResources.map((resource) => (
                  <React.Fragment key={resource.id}>
                    <ListItem>
                      <ListItemIcon>
                        {resource.type === 'folder' ? (
                          <Folder color="primary" />
                        ) : (
                          getFileIcon(resource.fileType || '')
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={resource.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {resource.author.name} • {new Date(resource.createdAt).toLocaleDateString()}
                            </Typography>
                            {resource.type === 'file' && resource.size && (
                              <Typography variant="body2" color="text.secondary">
                                {formatFileSize(resource.size)}
                              </Typography>
                            )}
                            {resource.tags.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {resource.tags.map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
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
                          {resource.type === 'file' && resource.url && (
                            <IconButton
                              onClick={() => handleDownload(resource.url!, resource.name)}
                              sx={{ mr: 1 }}
                            >
                              <Download />
                            </IconButton>
                          )}
                          {user?.role === 'Instructor' && (
                            <IconButton
                              onClick={(e) => {
                                setSelectedResource(resource);
                                setAnchorEl(e.currentTarget);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <Button
            component="label"
            htmlFor="file-upload"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          >
            Select File
          </Button>
          {selectedFile && (
            <Typography variant="body2">
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button onClick={handleFileUpload} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog
        open={showCreateFolderDialog}
        onClose={() => setShowCreateFolderDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Folder Name"
            value={newFolder.name}
            onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newFolder.description}
            onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resource Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setAnchorEl(null);
          // Implement edit functionality
        }}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedResource) {
            handleDeleteResource(selectedResource.id);
          }
          setAnchorEl(null);
        }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default CourseResources; 