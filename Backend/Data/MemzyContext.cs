using Microsoft.EntityFrameworkCore;

namespace Memzy_finalist.Models
{
    public partial class MemzyContext : DbContext
    {
        public MemzyContext() { }
        public MemzyContext(DbContextOptions<MemzyContext> options) : base(options) { }
        public virtual DbSet<UserHumorType> UserHumorTypes { get; set; }
        public virtual DbSet<Friendship> Friendships { get; set; }
        public virtual DbSet<FriendRequest> FriendRequests { get; set; }
        public virtual DbSet<HumorType> HumorTypes { get; set; }
        public virtual DbSet<Image> Images { get; set; }
        public virtual DbSet<Message> Messages { get; set; }
        public virtual DbSet<User> Users { get; set; }
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
   modelBuilder.Entity<Friendship>(entity =>
{
    entity.HasOne(d => d.User1)
        .WithMany(p => p.FriendsAsUser1)
        .HasForeignKey(d => d.User1Id)
        .OnDelete(DeleteBehavior.NoAction); // Changed to NoAction

    entity.HasOne(d => d.User2)
        .WithMany(p => p.FriendsAsUser2)
        .HasForeignKey(d => d.User2Id)
        .OnDelete(DeleteBehavior.NoAction); // Changed to NoAction

    entity.HasIndex(e => new { e.User1Id, e.User2Id }).IsUnique();
    entity.HasIndex(e => new { e.User2Id, e.User1Id }).IsUnique();
});

    modelBuilder.Entity<UserHumorType>()
        .HasKey(uht => new { uht.UserId, uht.HumorTypeId });

    modelBuilder.Entity<UserHumorType>()
        .HasOne(uht => uht.User)
        .WithMany(u => u.UserHumorTypes)
        .HasForeignKey(uht => uht.UserId);

    modelBuilder.Entity<UserHumorType>()
        .HasOne(uht => uht.HumorType)
        .WithMany(ht => ht.UserHumorTypes)
        .HasForeignKey(uht => uht.HumorTypeId);

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
        
        // Add unique constraint to prevent duplicate friend requests
        entity.HasIndex(fr => new { fr.SenderId, fr.ReceiverId })
            .IsUnique()
            .HasFilter($"[Status] = '{FriendRequestStatus.Pending}'");
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
}

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
    
}