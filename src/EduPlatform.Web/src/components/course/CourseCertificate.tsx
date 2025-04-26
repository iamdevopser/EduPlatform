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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download,
  Edit,
  Save,
  Delete,
  Add,
  Image,
  FormatColorText,
  FormatSize,
  FormatAlignCenter,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  completionDate: string;
  certificateNumber: string;
  instructorName: string;
  template: {
    backgroundImage: string;
    titleFont: string;
    titleSize: number;
    titleColor: string;
    titleAlign: 'left' | 'center' | 'right';
    bodyFont: string;
    bodySize: number;
    bodyColor: string;
    signatureImage: string;
    signatureName: string;
    signatureTitle: string;
  };
}

interface CertificateTemplate {
  id: string;
  name: string;
  backgroundImage: string;
  titleFont: string;
  titleSize: number;
  titleColor: string;
  titleAlign: 'left' | 'center' | 'right';
  bodyFont: string;
  bodySize: number;
  bodyColor: string;
  signatureImage: string;
  signatureName: string;
  signatureTitle: string;
}

const CourseCertificate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const [certResponse, templateResponse] = await Promise.all([
          axios.get(`/api/course/${id}/certificate`),
          axios.get(`/api/course/${id}/certificate/template`),
        ]);
        setCertificate(certResponse.data);
        setTemplate(templateResponse.data);
      } catch (err) {
        setError('Failed to fetch certificate data');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  const handleTemplateChange = (field: keyof CertificateTemplate, value: any) => {
    if (template) {
      setTemplate({ ...template, [field]: value });
    }
  };

  const handleSaveTemplate = async () => {
    if (!template) return;

    try {
      await axios.put(`/api/course/${id}/certificate/template`, template);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save certificate template');
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;

    try {
      const response = await axios.get(`/api/course/${id}/certificate/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download certificate');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !certificate) {
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
          Course Certificate
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.role === 'Instructor'
            ? 'Manage certificate template and view issued certificates'
            : 'View and download your course completion certificate'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Certificate Preview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Certificate Preview</Typography>
                {user?.role === 'Instructor' && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Template
                  </Button>
                )}
              </Box>
              <Paper
                sx={{
                  p: 4,
                  minHeight: '500px',
                  backgroundImage: `url(${template?.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    textAlign: template?.titleAlign,
                    color: template?.titleColor,
                    fontFamily: template?.titleFont,
                    fontSize: `${template?.titleSize}px`,
                    mb: 4,
                  }}
                >
                  Certificate of Completion
                </Box>
                <Box
                  sx={{
                    color: template?.bodyColor,
                    fontFamily: template?.bodyFont,
                    fontSize: `${template?.bodySize}px`,
                    mb: 4,
                  }}
                >
                  <Typography paragraph>
                    This is to certify that
                  </Typography>
                  <Typography variant="h5" paragraph>
                    {certificate?.studentName}
                  </Typography>
                  <Typography paragraph>
                    has successfully completed the course
                  </Typography>
                  <Typography variant="h5" paragraph>
                    {certificate?.courseTitle}
                  </Typography>
                  <Typography paragraph>
                    on {new Date(certificate?.completionDate || '').toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ position: 'absolute', bottom: 40, right: 40 }}>
                  <Box
                    component="img"
                    src={template?.signatureImage}
                    sx={{ height: 80, mb: 1 }}
                  />
                  <Typography variant="body2">{template?.signatureName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template?.signatureTitle}
                  </Typography>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Certificate Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Certificate Details
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Certificate Number
                </Typography>
                <Typography variant="body1">
                  {certificate?.certificateNumber}
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Issue Date
                </Typography>
                <Typography variant="body1">
                  {new Date(certificate?.completionDate || '').toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Instructor
                </Typography>
                <Typography variant="body1">
                  {certificate?.instructorName}
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
              >
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Template Editor Dialog */}
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Certificate Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Background Image URL"
                value={template?.backgroundImage || ''}
                onChange={(e) => handleTemplateChange('backgroundImage', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title Font"
                value={template?.titleFont || ''}
                onChange={(e) => handleTemplateChange('titleFont', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Title Size"
                value={template?.titleSize || 0}
                onChange={(e) => handleTemplateChange('titleSize', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title Color"
                value={template?.titleColor || ''}
                onChange={(e) => handleTemplateChange('titleColor', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Title Alignment</InputLabel>
                <Select
                  value={template?.titleAlign || 'center'}
                  label="Title Alignment"
                  onChange={(e) => handleTemplateChange('titleAlign', e.target.value)}
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Body Font"
                value={template?.bodyFont || ''}
                onChange={(e) => handleTemplateChange('bodyFont', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Body Size"
                value={template?.bodySize || 0}
                onChange={(e) => handleTemplateChange('bodySize', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Body Color"
                value={template?.bodyColor || ''}
                onChange={(e) => handleTemplateChange('bodyColor', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Signature Image URL"
                value={template?.signatureImage || ''}
                onChange={(e) => handleTemplateChange('signatureImage', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Signature Name"
                value={template?.signatureName || ''}
                onChange={(e) => handleTemplateChange('signatureName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Signature Title"
                value={template?.signatureTitle || ''}
                onChange={(e) => handleTemplateChange('signatureTitle', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained" startIcon={<Save />}>
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseCertificate; 