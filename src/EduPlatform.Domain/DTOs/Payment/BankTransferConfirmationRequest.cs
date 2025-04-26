namespace EduPlatform.Domain.DTOs.Payment
{
    public class BankTransferConfirmationRequest
    {
        public string TransactionId { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public DateTime TransferDate { get; set; }
        public string ReceiptImageUrl { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
} 