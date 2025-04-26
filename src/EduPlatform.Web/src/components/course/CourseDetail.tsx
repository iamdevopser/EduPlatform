import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Box,
    Rating,
    Divider,
} from '@mui/material';
import axios from 'axios';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    instructorName: string;
    rating: number;
    totalStudents: number;
    totalLessons: number;
    totalDuration: string;
    level: string;
    category: string;
    requirements: string[];
    whatYouWillLearn: string[];
}

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`/api/course/${id}`);
                setCourse(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching course:', error);
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    if (loading) {
        return <Typography>Loading course details...</Typography>;
    }

    if (!course) {
        return <Typography>Course not found</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h3" component="h1" gutterBottom>
                        {course.title}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        By {course.instructorName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={course.rating} readOnly precision={0.5} />
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                            ({course.totalStudents} students)
                        </Typography>
                    </Box>
                    <Typography variant="body1" paragraph>
                        {course.description}
                    </Typography>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h5" gutterBottom>
                        What you'll learn
                    </Typography>
                    <Grid container spacing={2}>
                        {course.whatYouWillLearn.map((item, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Typography variant="body1">• {item}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h5" gutterBottom>
                        Requirements
                    </Typography>
                    <ul>
                        {course.requirements.map((requirement, index) => (
                            <li key={index}>
                                <Typography variant="body1">{requirement}</Typography>
                            </li>
                        ))}
                    </ul>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" color="primary" gutterBottom>
                                ${course.price}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                sx={{ mb: 2 }}
                            >
                                Enroll Now
                            </Button>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                This course includes:
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                • {course.totalLessons} lessons
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                • {course.totalDuration} of content
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                • Level: {course.level}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                • Category: {course.category}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CourseDetail; 