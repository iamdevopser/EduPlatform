using EduPlatform.Domain.DTOs.Payment;
using EduPlatform.Domain.Models;
using EduPlatform.Domain.Services;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Services
{
    public class BankTransferPaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public BankTransferPaymentService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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
                PaymentProvider = "BankTransfer",
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
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.TransactionId == request.TransactionId);

            if (payment == null)
            {
                throw new Exception("Payment not found");
            }

            payment.Status = request.Status;
            payment.Notes = request.Notes;
            payment.PaidAt = DateTime.UtcNow;

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

        public async Task<BankTransferPayment> CreateBankTransferDetailsAsync(BankTransferRequest request)
        {
            var transactionId = await InitiatePaymentAsync(new PaymentIntentRequest
            {
                CourseId = request.CourseId,
                Amount = request.Amount,
                Currency = request.Currency,
                PaymentProvider = "BankTransfer"
            });

            var bankTransfer = new BankTransferPayment
            {
                PaymentId = (await GetPaymentStatusAsync(transactionId)).Id,
                BankName = request.BankName,
                AccountNumber = request.AccountNumber,
                AccountHolder = request.AccountHolder,
                ReferenceNumber = GenerateReferenceNumber(),
                CreatedAt = DateTime.UtcNow
            };

            await _context.BankTransferPayments.AddAsync(bankTransfer);
            await _context.SaveChangesAsync();

            return bankTransfer;
        }

        public async Task<BankTransferPayment> ConfirmBankTransferAsync(BankTransferConfirmationRequest request)
        {
            var bankTransfer = await _context.BankTransferPayments
                .Include(bt => bt.Payment)
                .FirstOrDefaultAsync(bt => bt.Payment.TransactionId == request.TransactionId);

            if (bankTransfer == null)
            {
                throw new Exception("Bank transfer not found");
            }

            bankTransfer.ReferenceNumber = request.ReferenceNumber;
            bankTransfer.TransferDate = request.TransferDate;
            bankTransfer.ReceiptImageUrl = request.ReceiptImageUrl;
            bankTransfer.VerificationNotes = request.Notes;

            await _context.SaveChangesAsync();

            return bankTransfer;
        }

        public async Task<BankTransferPayment> VerifyBankTransferAsync(string transactionId, bool isVerified, string? notes = null)
        {
            var bankTransfer = await _context.BankTransferPayments
                .Include(bt => bt.Payment)
                .FirstOrDefaultAsync(bt => bt.Payment.TransactionId == transactionId);

            if (bankTransfer == null)
            {
                throw new Exception("Bank transfer not found");
            }

            bankTransfer.Status = isVerified ? "Verified" : "Rejected";
            bankTransfer.VerificationNotes = notes;
            bankTransfer.VerifiedAt = DateTime.UtcNow;

            if (isVerified)
            {
                bankTransfer.Payment.Status = "Completed";
            }

            await _context.SaveChangesAsync();

            return bankTransfer;
        }

        private string GenerateReferenceNumber()
        {
            // Generate a unique reference number (e.g., BT-2024-XXXXX)
            return $"BT-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString().Substring(0, 5).ToUpper()}";
        }
    }
} 