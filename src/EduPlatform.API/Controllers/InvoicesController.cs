using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using EduPlatform.API.Services;

namespace EduPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoicesController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpPost("generate/{paymentId}")]
        public async Task<IActionResult> GenerateInvoice(Guid paymentId)
        {
            try
            {
                var invoice = await _invoiceService.GenerateInvoiceAsync(paymentId);
                return Ok(new { invoiceId = invoice.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{invoiceId}")]
        public async Task<IActionResult> GetInvoice(Guid invoiceId)
        {
            try
            {
                var pdfBytes = await _invoiceService.GetInvoicePdfAsync(invoiceId);
                return File(pdfBytes, "application/pdf", $"invoice_{invoiceId}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
} 