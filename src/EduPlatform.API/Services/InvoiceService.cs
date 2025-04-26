using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using EduPlatform.API.Data;
using EduPlatform.API.Models;

namespace EduPlatform.API.Services
{
    public interface IInvoiceService
    {
        Task<Invoice> GenerateInvoiceAsync(Guid paymentId);
        Task<byte[]> GetInvoicePdfAsync(Guid invoiceId);
    }

    public class InvoiceService : IInvoiceService
    {
        private readonly ApplicationDbContext _context;
        private readonly string _invoiceStoragePath;

        public InvoiceService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _invoiceStoragePath = configuration["InvoiceStorage:Path"];
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public async Task<Invoice> GenerateInvoiceAsync(Guid paymentId)
        {
            var payment = await _context.Payments
                .Include(p => p.Course)
                .Include(p => p.Student)
                .FirstOrDefaultAsync(p => p.Id == paymentId);

            if (payment == null)
            {
                throw new ArgumentException("Payment not found");
            }

            // Generate invoice number
            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{paymentId.ToString().Substring(0, 8)}";

            // Create invoice directory if it doesn't exist
            var invoiceDirectory = Path.Combine(_invoiceStoragePath, paymentId.ToString());
            Directory.CreateDirectory(invoiceDirectory);

            var invoice = new Invoice
            {
                Id = Guid.NewGuid(),
                PaymentId = paymentId,
                InvoiceNumber = invoiceNumber,
                IssueDate = DateTime.UtcNow,
                FilePath = Path.Combine(invoiceDirectory, $"{invoiceNumber}.pdf"),
                CreatedAt = DateTime.UtcNow
            };

            // Generate PDF
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(50);
                    page.Header().Text("Invoice").SemiBold().FontSize(20);
                    page.Content()
                        .PaddingVertical(20)
                        .Column(column =>
                        {
                            column.Spacing(20);
                            column.Item().Text($"Invoice Number: {invoiceNumber}");
                            column.Item().Text($"Date: {invoice.IssueDate:yyyy-MM-dd}");
                            column.Item().Text($"Student: {payment.Student.FullName}");
                            column.Item().Text($"Course: {payment.Course.Title}");
                            column.Item().Text($"Amount: {payment.Amount} {payment.Currency}");
                        });
                    page.Footer()
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.Span("Page ");
                            text.CurrentPageNumber();
                        });
                });
            });

            document.GeneratePdf(invoice.FilePath);

            await _context.Invoices.AddAsync(invoice);
            await _context.SaveChangesAsync();

            return invoice;
        }

        public async Task<byte[]> GetInvoicePdfAsync(Guid invoiceId)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            if (invoice == null || !File.Exists(invoice.FilePath))
            {
                throw new ArgumentException("Invoice not found");
            }

            return await File.ReadAllBytesAsync(invoice.FilePath);
        }
    }
} 