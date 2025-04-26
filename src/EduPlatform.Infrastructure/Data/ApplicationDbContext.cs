using Microsoft.EntityFrameworkCore;
using EduPlatform.Domain.Entities;

namespace EduPlatform.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Course> Courses { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<BankTransferPayment> BankTransferPayments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Payment entity
            modelBuilder.Entity<Payment>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Currency)
                .HasMaxLength(3);

            modelBuilder.Entity<Payment>()
                .Property(p => p.TransactionId)
                .HasMaxLength(100);

            // Configure BankTransferPayment entity
            modelBuilder.Entity<BankTransferPayment>()
                .HasKey(bt => bt.Id);

            modelBuilder.Entity<BankTransferPayment>()
                .HasOne(bt => bt.Payment)
                .WithOne()
                .HasForeignKey<BankTransferPayment>(bt => bt.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BankTransferPayment>()
                .Property(bt => bt.ReferenceNumber)
                .HasMaxLength(50);

            modelBuilder.Entity<BankTransferPayment>()
                .Property(bt => bt.Status)
                .HasMaxLength(20);
        }
    }
} 