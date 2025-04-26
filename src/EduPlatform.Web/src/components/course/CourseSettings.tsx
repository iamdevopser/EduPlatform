import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Delete,
  Visibility,
  VisibilityOff,
  Edit,
  Add,
  Remove,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface CourseSettings {
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  isPublished: boolean;
  isFeatured: boolean;
  requirements: string[];
  objectives: string[];
  thumbnailUrl: string;
  language: string;
  duration: number;
  maxStudents: number;
  certificateEnabled: boolean;
  discussionEnabled: boolean;
  assignmentEnabled: boolean;
  quizEnabled: boolean;
}

const CourseSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [settings, setSettings] = useState<CourseSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/course/${id}/settings`);
        setSettings(response.data);
      } catch (err) {
        setError('Failed to fetch course settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [id]);

  const handleChange = (field: keyof CourseSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleRequirementChange = (index: number, value: string) => {
    if (settings) {
      const newRequirements = [...settings.requirements];
      newRequirements[index] = value;
      setSettings({ ...settings, requirements: newRequirements });
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    if (settings) {
      const newObjectives = [...settings.objectives];
      newObjectives[index] = value;
      setSettings({ ...settings, objectives: newObjectives });
    }
  };

  const addRequirement = () => {
    if (settings) {
      setSettings({
        ...settings,
        requirements: [...settings.requirements, ''],
      });
    }
  };

  const removeRequirement = (index: number) => {
    if (settings) {
      const newRequirements = settings.requirements.filter((_, i) => i !== index);
      setSettings({ ...settings, requirements: newRequirements });
    }
  };

  const addObjective = () => {
    if (settings) {
      setSettings({
        ...settings,
        objectives: [...settings.objectives, ''],
      });
    }
  };

  const removeObjective = (index: number) => {
    if (settings) {
      const newObjectives = settings.objectives.filter((_, i) => i !== index);
      setSettings({ ...settings, objectives: newObjectives });
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(`/api/course/${id}/settings`, settings);
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !settings) {
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
          Course Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your course configuration and settings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Course Title"
                    value={settings?.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={settings?.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={settings?.category || ''}
                      label="Category"
                      onChange={(e) => handleChange('category', e.target.value)}
                    >
                      <MenuItem value="Programming">Programming</MenuItem>
                      <MenuItem value="Design">Design</MenuItem>
                      <MenuItem value="Business">Business</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="Language">Language</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Level</InputLabel>
                    <Select
                      value={settings?.level || ''}
                      label="Level"
                      onChange={(e) => handleChange('level', e.target.value)}
                    >
                      <MenuItem value="Beginner">Beginner</MenuItem>
                      <MenuItem value="Intermediate">Intermediate</MenuItem>
                      <MenuItem value="Advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Pricing and Visibility */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing and Visibility
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price ($)"
                    value={settings?.price || 0}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings?.isPublished || false}
                        onChange={(e) => handleChange('isPublished', e.target.checked)}
                      />
                    }
                    label="Publish Course"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings?.isFeatured || false}
                        onChange={(e) => handleChange('isFeatured', e.target.checked)}
                      />
                    }
                    label="Feature Course"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Course Structure */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Structure
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Duration (hours)"
                    value={settings?.duration || 0}
                    onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Students"
                    value={settings?.maxStudents || 0}
                    onChange={(e) => handleChange('maxStudents', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings?.certificateEnabled || false}
                        onChange={(e) => handleChange('certificateEnabled', e.target.checked)}
                      />
                    }
                    label="Enable Certificate"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Features */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings?.discussionEnabled || false}
                        onChange={(e) => handleChange('discussionEnabled', e.target.checked)}
                      />
                    }
                    label="Enable Discussions"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings?.assignmentEnabled || false}
                        onChange={(e) => handleChange('assignmentEnabled', e.target.checked)}
                      />
                    }
                    label="Enable Assignments"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings?.quizEnabled || false}
                        onChange={(e) => handleChange('quizEnabled', e.target.checked)}
                      />
                    }
                    label="Enable Quizzes"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Requirements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Requirements</Typography>
                <IconButton onClick={addRequirement} color="primary">
                  <Add />
                </IconButton>
              </Box>
              {settings?.requirements.map((requirement, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                  />
                  <IconButton onClick={() => removeRequirement(index)} color="error">
                    <Remove />
                  </IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Objectives */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Learning Objectives</Typography>
                <IconButton onClick={addObjective} color="primary">
                  <Add />
                </IconButton>
              </Box>
              {settings?.objectives.map((objective, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  />
                  <IconButton onClick={() => removeObjective(index)} color="error">
                    <Remove />
                  </IconButton>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseSettings; 