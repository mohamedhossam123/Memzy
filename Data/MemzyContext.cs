using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using static System.Console;
namespace Memzy_finalist.Models
{
    public partial class MemzyContext : DbContext
    {
        public MemzyContext()
        {
        }

        public MemzyContext(DbContextOptions<MemzyContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Friend> Friends { get; set; }
        public virtual DbSet<FriendRequest> FriendRequests { get; set; }
        public virtual DbSet<HumorType> HumorTypes { get; set; }
        public virtual DbSet<Image> Images { get; set; }
        public virtual DbSet<Message> Messages { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<UserHumorPreference> UserHumors { get; set; }
        public virtual DbSet<Video> Videos { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder
            .UseLazyLoadingProxies() ;
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("data source=DESKTOP-FM1OTR0;initial catalog=Memzy;trusted_connection=true;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Friend>(entity =>
            {
                entity.HasKey(e => e.FriendshipId)
                    .HasName("PK__Friends__4D531A741AE81307");

                entity.Property(e => e.FriendshipId).HasColumnName("FriendshipID");

                entity.Property(e => e.CanMessage).HasDefaultValueSql("((1))");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.User1Id).HasColumnName("User1ID");

                entity.Property(e => e.User2Id).HasColumnName("User2ID");

                entity.HasOne(d => d.User1)
                    .WithMany(p => p.FriendsAsUser1)
                    .HasForeignKey(d => d.FriendshipId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Friends__User1ID__5AB9788F");

                entity.HasOne(d => d.User2)
                    .WithMany(p => p.FriendsAsUser2)
                    .HasForeignKey(d => d.User2Id)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Friends__User2ID__5BAD9CC8");
            });

            modelBuilder.Entity<FriendRequest>(entity =>
            {
                entity.HasKey(e => e.RequestId)
                    .HasName("PK__FriendRe__33A8519A14A7B6E0");

                entity.Property(e => e.RequestId).HasColumnName("RequestID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.ReceiverId).HasColumnName("ReceiverID");

                entity.Property(e => e.SenderId).HasColumnName("SenderID");

                entity.Property(e => e.Status)
                    .HasMaxLength(20)
                    .HasDefaultValueSql("('Pending')");

                entity.HasOne(d => d.Receiver)
                    .WithMany(p => p.FriendRequestsReceived)
                    .HasForeignKey(d => d.ReceiverId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__FriendReq__Recei__625A9A57");

                entity.HasOne(d => d.Sender)
                    .WithMany(p => p.FriendRequestsSent)
                    .HasForeignKey(d => d.SenderId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__FriendReq__Sende__6166761E");
            });

            modelBuilder.Entity<HumorType>(entity =>
            {
                entity.HasIndex(e => e.HumorTypeName, "UQ__HumorTyp__1C1846CC09601AAA")
                    .IsUnique();

                entity.Property(e => e.HumorTypeId).HasColumnName("HumorTypeID");

                entity.Property(e => e.HumorTypeName)
                    .IsRequired()
                    .HasMaxLength(50);
            });

            modelBuilder.Entity<Image>(entity =>
            {
                entity.Property(e => e.ImageId).HasColumnName("ImageID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Description).HasMaxLength(500);

                entity.Property(e => e.ImageUrl)
                    .IsRequired()
                    .HasMaxLength(255)
                    .HasColumnName("ImageURL");

                entity.Property(e =>e.ImageLikeCounter)
                .HasDefaultValue(0)
                .HasColumnName("Likes");



                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Images)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Images__UserID__55F4C372");
            });

            modelBuilder.Entity<Message>(entity =>
            {
                entity.Property(e => e.MessageId).HasColumnName("MessageID");

                entity.Property(e => e.MessageText)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.Property(e => e.ReceiverId).HasColumnName("ReceiverID");

                entity.Property(e => e.SenderId).HasColumnName("SenderID");

                entity.Property(e => e.SentAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.HasOne(d => d.Receiver)
                    .WithMany(p => p.MessagesReceived)
                    .HasForeignKey(d => d.ReceiverId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Messages__Receiv__671F4F74");

                entity.HasOne(d => d.Sender)
                    .WithMany(p => p.MessagesSent)
                    .HasForeignKey(d => d.SenderId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Messages__Sender__662B2B3B");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email, "UQ__Users__A9D10534C32BF4C8")
                    .IsUnique();

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.Property(e => e.Bio)
                    .HasMaxLength(500)
                    .HasColumnName("BIO");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.ProfilePictureUrl)
                    .HasMaxLength(255)
                    .HasColumnName("ProfilePictureURL");
                entity.Property(e => e.Status)
                .HasDefaultValue("normal");
            });

            modelBuilder.Entity<UserHumorPreference>(entity =>
            {
                entity.ToTable("UserHumor");

                entity.Property(e => e.UserId).HasColumnName("UserHumorID");

                entity.Property(e => e.HumorTypeId).HasColumnName("HumorTypeID");

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.HasOne(d => d.HumorType)
                    .WithMany(p => p.UserHumorPreferences)
                    .HasForeignKey(d => d.HumorTypeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__UserHumor__Humor__4E53A1AA");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.UserHumorPreferences)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__UserHumor__UserI__4D5F7D71");
            });

            modelBuilder.Entity<Video>(entity =>
            {
                entity.Property(e => e.VideoId).HasColumnName("VideoID");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getdate())");

                entity.Property(e => e.Description).HasMaxLength(500);

                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.Property(e => e.VideoUrl)
                    .IsRequired()
                    .HasMaxLength(255)
                    .HasColumnName("VideoURL");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Videos)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Videos__UserID__5224328E");
            });
            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
