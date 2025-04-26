using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models
{
    public class Course
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        public string Description { get; set; }
        
        public string? ThumbnailUrl { get; set; }
        
        [Required]
        public decimal Price { get; set; }
        
        [Required]
        public string Currency { get; set; }
        
        [Required]
        public string Language { get; set; }
        
        [Required]
        public CourseLevel Level { get; set; }
        
        [Required]
        public string Category { get; set; }
        
        public CourseStatus Status { get; set; }
        
        public double? AverageRating { get; set; }
        
        public int? TotalReviews { get; set; }
        
        public int? TotalEnrollments { get; set; }
        
        [Required]
        public Guid InstructorId { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime? PublishedAt { get; set; }
        
        // Navigation properties
        public User Instructor { get; set; }
        public ICollection<CourseSection> Sections { get; set; }
        public ICollection<Enrollment> Enrollments { get; set; }
        public ICollection<CourseReview> Reviews { get; set; }
        public ICollection<CourseMaterial> Materials { get; set; }
    }

    public enum CourseLevel
    {
        Beginner,
        Intermediate,
        Advanced
    }

    public enum CourseStatus
    {
        Draft,
        PendingApproval,
        Published,
        Rejected
    }
} 