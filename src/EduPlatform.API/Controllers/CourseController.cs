using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduPlatform.API.Services;
using EduPlatform.API.Models;

namespace EduPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Course>>> GetPublishedCourses()
        {
            var courses = await _courseService.GetPublishedCoursesAsync();
            return Ok(courses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourse(Guid id)
        {
            var course = await _courseService.GetCourseByIdAsync(id);
            if (course == null)
            {
                return NotFound();
            }
            return Ok(course);
        }

        [Authorize(Roles = "Instructor")]
        [HttpGet("instructor")]
        public async Task<ActionResult<IEnumerable<Course>>> GetInstructorCourses()
        {
            var instructorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var courses = await _courseService.GetCoursesByInstructorAsync(instructorId);
            return Ok(courses);
        }

        [Authorize(Roles = "Instructor")]
        [HttpPost]
        public async Task<ActionResult<Course>> CreateCourse(Course course)
        {
            course.InstructorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var createdCourse = await _courseService.CreateCourseAsync(course);
            return CreatedAtAction(nameof(GetCourse), new { id = createdCourse.Id }, createdCourse);
        }

        [Authorize(Roles = "Instructor")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(Guid id, Course course)
        {
            if (id != course.Id)
            {
                return BadRequest();
            }

            try
            {
                await _courseService.UpdateCourseAsync(course);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Instructor")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var result = await _courseService.DeleteCourseAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [Authorize(Roles = "Instructor")]
        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitForApproval(Guid id)
        {
            var result = await _courseService.SubmitCourseForApprovalAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveCourse(Guid id)
        {
            var result = await _courseService.ApproveCourseAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectCourse(Guid id)
        {
            var result = await _courseService.RejectCourseAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return Ok();
        }
    }
} 