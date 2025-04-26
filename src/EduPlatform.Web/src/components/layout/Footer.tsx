import React from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Link,
    Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            EduPlatform
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Empowering learners worldwide with quality education.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Quick Links
                        </Typography>
                        <Box>
                            <Link
                                component={RouterLink}
                                to="/about"
                                color="inherit"
                                sx={{ display: 'block', mb: 1 }}
                            >
                                About Us
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/contact"
                                color="inherit"
                                sx={{ display: 'block', mb: 1 }}
                            >
                                Contact
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/faq"
                                color="inherit"
                                sx={{ display: 'block', mb: 1 }}
                            >
                                FAQ
                            </Link>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Legal
                        </Typography>
                        <Box>
                            <Link
                                component={RouterLink}
                                to="/privacy"
                                color="inherit"
                                sx={{ display: 'block', mb: 1 }}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/terms"
                                color="inherit"
                                sx={{ display: 'block', mb: 1 }}
                            >
                                Terms of Service
                            </Link>
                        </Box>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" align="center">
                    {'© '}
                    {new Date().getFullYear()}
                    {' EduPlatform. All rights reserved.'}
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer; 