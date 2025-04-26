using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduPlatform.API.Data;
using EduPlatform.API.Models;
using EduPlatform.API.Models.DTOs;

namespace EduPlatform.API.Services
{
    public interface IPaymentService
    {
        Task<Payment> CreatePaymentAsync(ConfirmPaymentRequest request);
        Task<bool> IsCourseAlreadyPurchasedAsync(Guid courseId, Guid studentId);
    }

    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IStripeService _stripeService;

        public PaymentService(ApplicationDbContext context, IStripeService stripeService)
        {
            _context = context;
            _stripeService = stripeService;
        }

        public async Task<Payment> CreatePaymentAsync(ConfirmPaymentRequest request)
        {
            // Check if course is already purchased
            if (await IsCourseAlreadyPurchasedAsync(request.CourseId, request.StudentId))
            {
                throw new InvalidOperationException("Course is already purchased");
            }

            // Create payment record
            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                CourseId = request.CourseId,
                StudentId = request.StudentId,
                Amount = request.Amount,
                Currency = request.Currency,
                StripeIntentId = request.PaymentIntentId,
                IsSuccessful = true,
                PaidAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            // Create enrollment
            var enrollment = new Enrollment
            {
                Id = Guid.NewGuid(),
                CourseId = request.CourseId,
                StudentId = request.StudentId,
                IsCompleted = false,
                EnrolledAt = DateTime.UtcNow,
                ProgressPercentage = 0
            };

            await _context.Payments.AddAsync(payment);
            await _context.Enrollments.AddAsync(enrollment);
            await _context.SaveChangesAsync();

            return payment;
        }

        public async Task<bool> IsCourseAlreadyPurchasedAsync(Guid courseId, Guid studentId)
        {
            return await _context.Enrollments
                .AnyAsync(e => e.CourseId == courseId && e.StudentId == studentId);
        }
    }
} 