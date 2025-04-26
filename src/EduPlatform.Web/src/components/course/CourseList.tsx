import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    instructorName: string;
    rating: number;
}

const CourseList: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('/api/course');
                setCourses(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return <Typography>Loading courses...</Typography>;
    }

    return (
        <Grid container spacing={3}>
            {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                {course.title}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom>
                                By {course.instructorName}
                            </Typography>
                            <Typography variant="body2" component="p">
                                {course.description}
                            </Typography>
                            <Typography variant="h6" color="primary">
                                ${course.price}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Rating: {course.rating}/5
                            </Typography>
                            <Button
                                component={Link}
                                to={`/course/${course.id}`}
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                View Course
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default CourseList; 