using System;
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models
{
    public class Payment
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid CourseId { get; set; }
        
        [Required]
        public Guid StudentId { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public string Currency { get; set; }
        
        [Required]
        public string StripeIntentId { get; set; }
        
        public bool IsSuccessful { get; set; }
        
        public DateTime PaidAt { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        // Navigation properties
        public Course Course { get; set; }
        public User Student { get; set; }
    }

    public class Enrollment
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid CourseId { get; set; }
        
        [Required]
        public Guid StudentId { get; set; }
        
        public bool IsCompleted { get; set; }
        
        public DateTime EnrolledAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        public int ProgressPercentage { get; set; }
        
        // Navigation properties
        public Course Course { get; set; }
        public User Student { get; set; }
        public ICollection<LessonProgress> LessonProgresses { get; set; }
    }

    public class LessonProgress
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid EnrollmentId { get; set; }
        
        [Required]
        public Guid LessonId { get; set; }
        
        public bool IsCompleted { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        // Navigation properties
        public Enrollment Enrollment { get; set; }
        public Lesson Lesson { get; set; }
    }
} 