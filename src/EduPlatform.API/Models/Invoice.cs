using System;
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models
{
    public class Invoice
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid PaymentId { get; set; }
        
        [Required]
        public string InvoiceNumber { get; set; }
        
        [Required]
        public DateTime IssueDate { get; set; }
        
        [Required]
        public string FilePath { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        // Navigation properties
        public Payment Payment { get; set; }
    }
} 