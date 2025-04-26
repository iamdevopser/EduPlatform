using System;
using System.Threading.Tasks;
using EduPlatform.Domain.DTOs.Payment;
using EduPlatform.Domain.Models;
using EduPlatform.Domain.Services;
using EduPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Services
{
    public interface IPaymentService
    {
        Task<string> InitiatePaymentAsync(PaymentIntentRequest request);
        Task<Payment> ConfirmPaymentAsync(ConfirmPaymentRequest request);
        Task<bool> IsCourseAlreadyPurchasedAsync(Guid courseId, Guid studentId);
        Task<Payment> GetPaymentStatusAsync(string transactionId);
    }

    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;

        public PaymentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> InitiatePaymentAsync(PaymentIntentRequest request)
        {
            // Generate a unique transaction ID
            var transactionId = Guid.NewGuid().ToString();

            // Create a pending payment record
            var payment = new Payment
            {
                CourseId = request.CourseId,
                Amount = request.Amount,
                Currency = request.Currency,
                PaymentProvider = request.PaymentProvider,
                TransactionId = transactionId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _context.Payments.AddAsync(payment);
            await _context.SaveChangesAsync();

            return transactionId;
        }

        public async Task<Payment> ConfirmPaymentAsync(ConfirmPaymentRequest request)
        {
            var payment = new Payment
            {
                CourseId = request.CourseId,
                StudentId = request.StudentId,
                Amount = request.Amount,
                Currency = request.Currency,
                PaymentProvider = request.PaymentProvider,
                TransactionId = request.TransactionId,
                Status = request.Status,
                Notes = request.Notes,
                PaidAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Payments.AddAsync(payment);
            await _context.SaveChangesAsync();

            return payment;
        }

        public async Task<bool> IsCourseAlreadyPurchasedAsync(Guid courseId, Guid studentId)
        {
            return await _context.Payments
                .AnyAsync(p => p.CourseId == courseId && 
                             p.StudentId == studentId && 
                             p.Status == "Completed");
        }

        public async Task<Payment> GetPaymentStatusAsync(string transactionId)
        {
            return await _context.Payments
                .FirstOrDefaultAsync(p => p.TransactionId == transactionId);
        }
    }
} 