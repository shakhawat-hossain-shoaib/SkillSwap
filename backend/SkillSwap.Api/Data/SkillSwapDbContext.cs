using Microsoft.EntityFrameworkCore;
using SkillSwap.Api.Models;
using SkillSwap.Api.Models.Enums;

namespace SkillSwap.Api.Data;

public class SkillSwapDbContext : DbContext
{
    public SkillSwapDbContext(DbContextOptions<SkillSwapDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserSkill> UserSkills => Set<UserSkill>();
    public DbSet<ExchangeRequest> ExchangeRequests => Set<ExchangeRequest>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Bootcamp> Bootcamps => Set<Bootcamp>();
    public DbSet<BootcampEnrollment> BootcampEnrollments => Set<BootcampEnrollment>();
    public DbSet<Admin> Admins => Set<Admin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ════════════════════════════════════════════════════════════
        //  ADMIN
        // ════════════════════════════════════════════════════════════
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(a => a.AdminId);
            entity.HasIndex(a => a.EmailAddress).IsUnique();
            entity.Property(a => a.FullName).IsRequired().HasMaxLength(100);
            entity.Property(a => a.EmailAddress).IsRequired().HasMaxLength(255);
            entity.Property(a => a.PasswordHash).IsRequired();
            entity.Property(a => a.Role).HasMaxLength(50).HasDefaultValue("Admin");
            entity.Property(a => a.RefreshToken).HasMaxLength(200);
            entity.Property(a => a.CreatedAt).HasDefaultValueSql("(UTC_TIMESTAMP())");
        });

        // ════════════════════════════════════════════════════════════
        //  USER
        // ════════════════════════════════════════════════════════════
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.UserId);

            entity.HasIndex(u => u.EmailAddress).IsUnique();

            entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.EmailAddress).IsRequired().HasMaxLength(255);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.BioDetails).HasMaxLength(1000);
            entity.Property(u => u.ProfilePicture).HasMaxLength(500);
            entity.Property(u => u.PortfolioLinks).HasMaxLength(2000);
            entity.Property(u => u.RefreshToken).HasMaxLength(200);
            entity.Property(u => u.IsAdmin).HasDefaultValue(false);
            entity.Property(u => u.TrustRating).HasPrecision(3, 2).HasDefaultValue(0m);
        });

        // ════════════════════════════════════════════════════════════
        //  USER SKILL
        // ════════════════════════════════════════════════════════════
        modelBuilder.Entity<UserSkill>(entity =>
        {
            entity.HasKey(us => us.UserSkillId);

            entity.Property(us => us.SkillName).IsRequired().HasMaxLength(150);

            // Store enums as strings for readability in the database
            entity.Property(us => us.TypeTag)
                  .HasConversion<string>()
                  .HasMaxLength(10);

            entity.Property(us => us.ProficiencyLevel)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.HasOne(us => us.User)
                  .WithMany(u => u.Skills)
                  .HasForeignKey(us => us.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ════════════════════════════════════════════════════════════
        //  EXCHANGE REQUEST
        // ════════════════════════════════════════════════════════════
        modelBuilder.Entity<ExchangeRequest>(entity =>
        {
            entity.HasKey(er => er.RequestId);

            entity.Property(er => er.Status)
                  .HasConversion<string>()
                  .HasMaxLength(20);

            entity.Property(er => er.LearningGoals).IsRequired();
            entity.Property(er => er.EstimatedDuration).IsRequired().HasMaxLength(100);

            entity.Property(er => er.CreatedAt)
                  .HasDefaultValueSql("(UTC_TIMESTAMP())");

            entity.HasOne(er => er.Sender)
                  .WithMany(u => u.SentRequests)
                  .HasForeignKey(er => er.SenderId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(er => er.Receiver)
                  .WithMany(u => u.ReceivedRequests)
                  .HasForeignKey(er => er.ReceiverId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ════════════════════════════════════════════════════════════
        //  SESSION
        // ════════════════════════════════════════════════════════════
        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(s => s.SessionId);

            entity.Property(s => s.MeetingLink).HasMaxLength(500);

            entity.Property(s => s.Status)
                  .HasConversion<string>()
                  .HasMaxLength(15);

            entity.HasOne(s => s.ExchangeRequest)
                  .WithMany(er => er.Sessions)
                  .HasForeignKey(s => s.RequestId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ════════════════════════════════════════════════════════════
        //  MESSAGE
        // ════════════════════════════════════════════════════════════
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(m => m.MessageId);

            entity.Property(m => m.MessageBody).IsRequired().HasMaxLength(4000);
            entity.Property(m => m.IsRead).HasDefaultValue(false);

            entity.Property(m => m.SentTimestamp)
                  .HasDefaultValueSql("(UTC_TIMESTAMP())");

            entity.HasOne(m => m.Sender)
                  .WithMany(u => u.SentMessages)
                  .HasForeignKey(m => m.SenderId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Receiver)
                  .WithMany(u => u.ReceivedMessages)
                  .HasForeignKey(m => m.ReceiverId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ════════════════════════════════════════════════════════════
        //  REVIEW
        // ════════════════════════════════════════════════════════════
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(r => r.ReviewId);

            entity.Property(r => r.RatingValue).IsRequired();
            entity.Property(r => r.WrittenFeedback).HasMaxLength(2000);

            entity.HasOne(r => r.Session)
                  .WithMany(s => s.Reviews)
                  .HasForeignKey(r => r.SessionId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Reviewer)
                  .WithMany(u => u.ReviewsGiven)
                  .HasForeignKey(r => r.ReviewerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Reviewee)
                  .WithMany(u => u.ReviewsReceived)
                  .HasForeignKey(r => r.RevieweeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ════════════════════════════════════════════════════════════
        //  BOOTCAMP
        // ════════════════════════════════════════════════════════════
        modelBuilder.Entity<Bootcamp>(entity =>
        {
            entity.HasKey(b => b.BootcampId);

            entity.Property(b => b.TopicTitle).IsRequired().HasMaxLength(200);
            entity.Property(b => b.Slug).HasMaxLength(150);
            entity.Property(b => b.Category).HasMaxLength(100).HasDefaultValue("General");
            entity.Property(b => b.Difficulty).HasMaxLength(30).HasDefaultValue("Beginner");
            entity.Property(b => b.Duration).HasMaxLength(50).HasDefaultValue("4 weeks");
            entity.Property(b => b.Instructor).HasMaxLength(100).HasDefaultValue("SkillSwap Faculty");
            entity.Property(b => b.InstructorAvatar).HasMaxLength(255);
            entity.Property(b => b.Thumbnail).HasMaxLength(100).HasDefaultValue("🚀");
            entity.Property(b => b.ContentPath).HasMaxLength(255);
            entity.Property(b => b.Rating).HasPrecision(3, 2).HasDefaultValue(5.00m);
            entity.Property(b => b.EnrolledCount).HasDefaultValue(0);
            entity.Property(b => b.MaxParticipantCap).HasDefaultValue(50);
            entity.Property(b => b.CreatedAt).HasDefaultValueSql("(UTC_TIMESTAMP())");

            entity.HasOne(b => b.Organizer)
                  .WithMany(u => u.OrganizedBootcamps)
                  .HasForeignKey(b => b.OrganizerId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // ════════════════════════════════════════════════════════════
        //  BOOTCAMP ENROLLMENT
        // ════════════════════════════════════════════════════════════
        modelBuilder.Entity<BootcampEnrollment>(entity =>
        {
            entity.HasKey(be => be.EnrollmentId);

            // Prevent duplicate enrollments
            entity.HasIndex(be => new { be.BootcampId, be.ParticipantId }).IsUnique();

            entity.Property(be => be.EnrolledAt)
                  .HasDefaultValueSql("(UTC_TIMESTAMP())");

            entity.HasOne(be => be.Bootcamp)
                  .WithMany(b => b.Enrollments)
                  .HasForeignKey(be => be.BootcampId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(be => be.Participant)
                  .WithMany(u => u.Enrollments)
                  .HasForeignKey(be => be.ParticipantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
