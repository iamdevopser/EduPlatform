import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  TextField,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Timer,
  Help,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number;
  questions: Question[];
  totalPoints: number;
  attemptsAllowed: number;
  showAnswers: boolean;
}

interface QuizAttempt {
  id: string;
  score: number;
  timeSpent: number;
  completedAt: string;
  answers: {
    questionId: string;
    answer: string;
    isCorrect: boolean;
  }[];
}

const CourseQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/api/course/${id}/quiz`);
        setQuiz(response.data);
        setTimeLeft(response.data.timeLimit * 60);
      } catch (err) {
        setError('Failed to fetch quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/course/${id}/quiz/submit`, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
        timeSpent: quiz.timeLimit * 60 - timeLeft,
      });
      setAttempt(response.data);
      setShowResults(true);
    } catch (err) {
      setError('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !quiz) {
    return (
      <Container>
        <Alert severity="error">{error || 'Quiz not found'}</Alert>
      </Container>
    );
  }

  if (showResults && attempt) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Quiz Results
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Score
                    </Typography>
                    <Typography variant="h3" color={attempt.score >= quiz.passingScore ? 'success.main' : 'error.main'}>
                      {attempt.score}%
                    </Typography>
                    <Chip
                      label={attempt.score >= quiz.passingScore ? 'Passed' : 'Failed'}
                      color={attempt.score >= quiz.passingScore ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Time Spent
                    </Typography>
                    <Typography variant="h3">
                      {formatTime(attempt.timeSpent)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      of {quiz.timeLimit} minutes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h5" gutterBottom>
            Question Review
          </Typography>
          {quiz.questions.map((question, index) => {
            const userAnswer = attempt.answers.find(a => a.questionId === question.id);
            return (
              <Paper key={question.id} sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Question {index + 1}
                  </Typography>
                  <Chip
                    icon={userAnswer?.isCorrect ? <CheckCircle /> : <Error />}
                    label={userAnswer?.isCorrect ? 'Correct' : 'Incorrect'}
                    color={userAnswer?.isCorrect ? 'success' : 'error'}
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  {question.text}
                </Typography>
                {question.type !== 'short-answer' && (
                  <RadioGroup value={userAnswer?.answer}>
                    {question.options?.map((option) => (
                      <FormControlLabel
                        key={option.id}
                        value={option.id}
                        control={<Radio />}
                        label={option.text}
                        disabled
                      />
                    ))}
                  </RadioGroup>
                )}
                {question.explanation && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Explanation
                    </Typography>
                    <Typography variant="body2">
                      {question.explanation}
                    </Typography>
                  </Box>
                )}
              </Paper>
            );
          })}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => navigate(`/course/${id}/learn`)}
            >
              Continue Learning
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            {quiz.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Timer color="primary" />
            <Typography variant="h6">
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" paragraph>
          {quiz.description}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <LinearProgress
            variant="determinate"
            value={(activeStep / quiz.questions.length) * 100}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Question {activeStep + 1} of {quiz.questions.length}
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {quiz.questions[activeStep].text}
          </Typography>
          {quiz.questions[activeStep].type !== 'short-answer' ? (
            <RadioGroup
              value={answers[quiz.questions[activeStep].id] || ''}
              onChange={(e) => handleAnswerChange(quiz.questions[activeStep].id, e.target.value)}
            >
              {quiz.questions[activeStep].options?.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.text}
                />
              ))}
            </RadioGroup>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={answers[quiz.questions[activeStep].id] || ''}
              onChange={(e) => handleAnswerChange(quiz.questions[activeStep].id, e.target.value)}
              placeholder="Type your answer here..."
            />
          )}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<NavigateBefore />}
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Previous
          </Button>
          {activeStep === quiz.questions.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<CheckCircle />}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              endIcon={<NavigateNext />}
              onClick={handleNext}
              disabled={!answers[quiz.questions[activeStep].id]}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CourseQuiz; 