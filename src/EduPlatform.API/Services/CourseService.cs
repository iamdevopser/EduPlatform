using Microsoft.EntityFrameworkCore;
using EduPlatform.API.Data;
using EduPlatform.API.Models;

namespace EduPlatform.API.Services
{
    public interface ICourseService
    {
        Task<Course> CreateCourseAsync(Course course);
        Task<Course> UpdateCourseAsync(Course course);
        Task<bool> DeleteCourseAsync(Guid courseId);
        Task<Course> GetCourseByIdAsync(Guid courseId);
        Task<IEnumerable<Course>> GetCoursesByInstructorAsync(Guid instructorId);
        Task<IEnumerable<Course>> GetPublishedCoursesAsync();
        Task<bool> SubmitCourseForApprovalAsync(Guid courseId);
        Task<bool> ApproveCourseAsync(Guid courseId);
        Task<bool> RejectCourseAsync(Guid courseId);
    }

    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _context;

        public CourseService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Course> CreateCourseAsync(Course course)
        {
            course.Status = CourseStatus.Draft;
            course.CreatedAt = DateTime.UtcNow;
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return course;
        }

        public async Task<Course> UpdateCourseAsync(Course course)
        {
            var existingCourse = await _context.Courses
                .Include(c => c.Sections)
                .FirstOrDefaultAsync(c => c.Id == course.Id);

            if (existingCourse == null)
            {
                throw new Exception("Course not found");
            }

            // Update basic course information
            existingCourse.Title = course.Title;
            existingCourse.Description = course.Description;
            existingCourse.Price = course.Price;
            existingCourse.Currency = course.Currency;
            existingCourse.Language = course.Language;
            existingCourse.Level = course.Level;
            existingCourse.Category = course.Category;
            existingCourse.ThumbnailUrl = course.ThumbnailUrl;

            await _context.SaveChangesAsync();
            return existingCourse;
        }

        public async Task<bool> DeleteCourseAsync(Guid courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return false;
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Course> GetCourseByIdAsync(Guid courseId)
        {
            return await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons)
                .FirstOrDefaultAsync(c => c.Id == courseId);
        }

        public async Task<IEnumerable<Course>> GetCoursesByInstructorAsync(Guid instructorId)
        {
            return await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .Include(c => c.Sections)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Course>> GetPublishedCoursesAsync()
        {
            return await _context.Courses
                .Where(c => c.Status == CourseStatus.Published)
                .Include(c => c.Instructor)
                .OrderByDescending(c => c.PublishedAt)
                .ToListAsync();
        }

        public async Task<bool> SubmitCourseForApprovalAsync(Guid courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return false;
            }

            course.Status = CourseStatus.PendingApproval;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveCourseAsync(Guid courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return false;
            }

            course.Status = CourseStatus.Published;
            course.PublishedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectCourseAsync(Guid courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return false;
            }

            course.Status = CourseStatus.Rejected;
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 