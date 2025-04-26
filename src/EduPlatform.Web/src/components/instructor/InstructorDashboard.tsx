import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    status: string;
    totalStudents: number;
    rating: number;
    createdAt: string;
}

const InstructorDashboard: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/course/instructor');
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (course?: Course) => {
        setSelectedCourse(course || null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCourse(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const courseData = {
            title: formData.get('title'),
            description: formData.get('description'),
            price: Number(formData.get('price')),
            status: formData.get('status'),
        };

        try {
            if (selectedCourse) {
                await axios.put(`/api/course/${selectedCourse.id}`, courseData);
            } else {
                await axios.post('/api/course', courseData);
            }
            fetchCourses();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving course:', error);
        }
    };

    const handleDelete = async (courseId: string) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`/api/course/${courseId}`);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Instructor Dashboard
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Create Course
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Courses
                            </Typography>
                            <Typography variant="h4">{courses.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Students
                            </Typography>
                            <Typography variant="h4">
                                {courses.reduce((sum, course) => sum + course.totalStudents, 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Average Rating
                            </Typography>
                            <Typography variant="h4">
                                {courses.length > 0
                                    ? (courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)
                                    : '0.0'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Students</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={course.status}
                                        color={
                                            course.status === 'Published'
                                                ? 'success'
                                                : course.status === 'Draft'
                                                ? 'default'
                                                : 'warning'
                                        }
                                    />
                                </TableCell>
                                <TableCell>{course.totalStudents}</TableCell>
                                <TableCell>{course.rating.toFixed(1)}</TableCell>
                                <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenDialog(course)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(course.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="title"
                            label="Course Title"
                            type="text"
                            fullWidth
                            defaultValue={selectedCourse?.title}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            defaultValue={selectedCourse?.description}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="price"
                            label="Price"
                            type="number"
                            fullWidth
                            defaultValue={selectedCourse?.price}
                            required
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                defaultValue={selectedCourse?.status || 'Draft'}
                                label="Status"
                                required
                            >
                                <MenuItem value="Draft">Draft</MenuItem>
                                <MenuItem value="Pending">Pending Review</MenuItem>
                                <MenuItem value="Published">Published</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {selectedCourse ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default InstructorDashboard; 