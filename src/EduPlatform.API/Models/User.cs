using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models
{
    public class User
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; }
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; }
        
        [Required]
        [EmailAddress]
        [StringLength(256)]
        public string Email { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        public string? PhoneNumber { get; set; }
        
        public string? ProfilePictureUrl { get; set; }
        
        public string? Bio { get; set; }
        
        public UserRole Role { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime? LastLoginAt { get; set; }
        
        // Navigation properties
        public ICollection<Course> Courses { get; set; }
        public ICollection<Enrollment> Enrollments { get; set; }
        public ICollection<CourseReview> Reviews { get; set; }
        public ICollection<Message> SentMessages { get; set; }
        public ICollection<Message> ReceivedMessages { get; set; }
        public ICollection<Notification> Notifications { get; set; }
    }

    public enum UserRole
    {
        Student,
        Instructor,
        Admin
    }
} 