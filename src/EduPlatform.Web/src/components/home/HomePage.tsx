import React from 'react';
import {
    Container,
    Typography,
    Button,
    Grid,
    Box,
    Card,
    CardContent,
    CardMedia,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const HomePage: React.FC = () => {
    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    pt: 8,
                    pb: 6,
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        component="h1"
                        variant="h2"
                        align="center"
                        color="text.primary"
                        gutterBottom
                    >
                        Learn Anything, Anytime
                    </Typography>
                    <Typography variant="h5" align="center" color="text.secondary" paragraph>
                        Discover thousands of courses taught by industry experts.
                        Start learning today and advance your career.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                            variant="contained"
                            size="large"
                            component={RouterLink}
                            to="/courses"
                        >
                            Browse Courses
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Container sx={{ py: 8 }} maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                <Typography gutterBottom variant="h5" component="h2">
                                    Expert Instructors
                                </Typography>
                                <Typography>
                                    Learn from industry professionals with years of experience in their fields.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                <Typography gutterBottom variant="h5" component="h2">
                                    Career Growth
                                </Typography>
                                <Typography>
                                    Gain skills that employers are looking for and advance your career.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <AccessTimeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                <Typography gutterBottom variant="h5" component="h2">
                                    Flexible Learning
                                </Typography>
                                <Typography>
                                    Learn at your own pace with lifetime access to course materials.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Call to Action */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    py: 8,
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h4" align="center" gutterBottom>
                        Ready to Start Learning?
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ mb: 4 }}>
                        Join thousands of students who are already learning on EduPlatform.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                bgcolor: 'background.paper',
                                color: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'background.paper',
                                },
                            }}
                            component={RouterLink}
                            to="/signup"
                        >
                            Get Started
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage; 