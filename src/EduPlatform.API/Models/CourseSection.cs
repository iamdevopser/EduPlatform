using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models
{
    public class CourseSection
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        public string? Description { get; set; }
        
        [Required]
        public int Order { get; set; }
        
        [Required]
        public Guid CourseId { get; set; }
        
        // Navigation properties
        public Course Course { get; set; }
        public ICollection<Lesson> Lessons { get; set; }
    }

    public class Lesson
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        public string? Description { get; set; }
        
        public string? VideoUrl { get; set; }
        
        public int? DurationInMinutes { get; set; }
        
        [Required]
        public int Order { get; set; }
        
        [Required]
        public Guid SectionId { get; set; }
        
        // Navigation properties
        public CourseSection Section { get; set; }
        public ICollection<CourseMaterial> Materials { get; set; }
    }
} 