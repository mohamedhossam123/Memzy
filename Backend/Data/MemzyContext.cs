using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Memzy_finalist.Models
{
    public partial class MemzyContext : DbContext
    {
        public MemzyContext() { }
        public MemzyContext(DbContextOptions<MemzyContext> options) : base(options) { }

        public virtual DbSet<Friend> Friends { get; set; }
        public virtual DbSet<FriendRequest> FriendRequests { get; set; }
        public virtual DbSet<HumorType> HumorTypes { get; set; }
        public virtual DbSet<Image> Images { get; set; }
        public virtual DbSet<Message> Messages { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<UserHumorPreference> UserHumorPreferences { get; set; }
        public virtual DbSet<Video> Videos { get; set; }
        public virtual DbSet<ImageHumor> ImageHumors { get; set; }
        public virtual DbSet<VideoHumor> VideoHumors { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseLazyLoadingProxies();
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("data source=DESKTOP-FM1OTR0;initial catalog=Memzy;trusted_connection=true;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Friend>(entity =>
    {
        entity.HasKey(e => e.FriendshipId);

        entity.HasOne(d => d.User1)
            .WithMany(p => p.FriendsAsUser1)
            .HasForeignKey(d => d.User1Id)
            .OnDelete(DeleteBehavior.NoAction);

        entity.HasOne(d => d.User2)
            .WithMany(p => p.FriendsAsUser2)
            .HasForeignKey(d => d.User2Id)
            .OnDelete(DeleteBehavior.NoAction);
    });
            modelBuilder.Entity<Message>(entity =>
    {
        entity.HasKey(e => e.MessageId);
        entity.HasOne(m => m.Sender)
            .WithMany(u => u.MessagesSent)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(m => m.Receiver)
            .WithMany(u => u.MessagesReceived)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);
    });
            modelBuilder.Entity<FriendRequest>(entity =>
    {
        entity.HasKey(e => e.RequestId);

        entity.HasOne(d => d.Sender)
            .WithMany(p => p.FriendRequestsSent)
            .HasForeignKey(d => d.SenderId)
            .OnDelete(DeleteBehavior.NoAction); 

        entity.HasOne(d => d.Receiver)
            .WithMany(p => p.FriendRequestsReceived)
            .HasForeignKey(d => d.ReceiverId)
            .OnDelete(DeleteBehavior.NoAction);
    });
            modelBuilder.Entity<Image>(entity =>
            {
                entity.HasOne(d => d.User)
                    .WithMany(p => p.Images)
                    .HasForeignKey(d => d.UserId);
            });
            modelBuilder.Entity<Video>(entity =>
            {
                entity.HasOne(d => d.User)
                    .WithMany(p => p.Videos)
                    .HasForeignKey(d => d.UserId);
            });
            modelBuilder.Entity<ImageHumor>(entity =>
            {
                entity.HasOne(ih => ih.Image)
                    .WithMany(i => i.ImageHumors)
                    .HasForeignKey(ih => ih.ImageId);
                entity.HasOne(ih => ih.HumorType)
                    .WithMany(ht => ht.ImageHumors)
                    .HasForeignKey(ih => ih.HumorTypeId);
            });

            modelBuilder.Entity<VideoHumor>(entity =>
            {
                entity.HasOne(vh => vh.Video)
                    .WithMany(v => v.VideoHumors)
                    .HasForeignKey(vh => vh.VideoId);
                entity.HasOne(vh => vh.HumorType)
                    .WithMany(ht => ht.VideoHumors)
                    .HasForeignKey(vh => vh.HumorTypeId);
            });

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<HumorType>()
                .HasIndex(ht => ht.HumorTypeName)
                .IsUnique();

            OnModelCreatingPartial(modelBuilder);
            modelBuilder.Entity<UserHumorPreference>(entity =>
{
    entity.HasKey(uhp => new { uhp.UserId, uhp.HumorTypeId });

    entity.HasOne(uhp => uhp.User)
        .WithMany(u => u.UserHumorPreferences)
        .HasForeignKey(uhp => uhp.UserId)
        .OnDelete(DeleteBehavior.Cascade); // Explicit delete behavior

    entity.HasOne(uhp => uhp.HumorType)
        .WithMany(ht => ht.UserHumorPreferences)
        .HasForeignKey(uhp => uhp.HumorTypeId)
        .OnDelete(DeleteBehavior.Cascade);
});
        }
        

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}