using Memzy_finalist.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Memzy_finalist.Models
{
    public partial class MemzyContext : DbContext
    {
        public MemzyContext() { }
        public MemzyContext(DbContextOptions<MemzyContext> options) : base(options) { }
        public virtual DbSet<UserHumorType> UserHumorTypes { get; set; }
        public virtual DbSet<PostLike> PostLikes { get; set; }
        public virtual DbSet<Friendship> Friendships { get; set; }
        public virtual DbSet<FriendRequest> FriendRequests { get; set; }
        public virtual DbSet<HumorType> HumorTypes { get; set; }
        public virtual DbSet<Post> Posts { get; set; }
        public virtual DbSet<PostHumor> PostHumors { get; set; }
        public virtual DbSet<Message> Messages { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Comment> Comments { get; set; }
        public virtual DbSet<CommentLike> CommentLikes { get; set; }
        public virtual DbSet<Groups> Groups { get; set; }
        public virtual DbSet<GroupMember> GroupMembers { get; set; }
        public virtual DbSet<GroupMessage> GroupMessages { get; set; }

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
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(c => c.CommentId);

                entity.HasOne(c => c.Post)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(c => c.PostId)
                    .OnDelete(DeleteBehavior.Cascade); 

                entity.HasOne(c => c.User)
                    .WithMany(u => u.Comments)
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(c => c.ParentComment)
                    .WithMany(c => c.Replies)
                    .HasForeignKey(c => c.ParentCommentId)
                    .OnDelete(DeleteBehavior.Restrict); 
            });

            modelBuilder.Entity<Groups>(entity =>
            {
                entity.HasKey(g => g.GroupId);
                entity.Property(g => g.GroupName).IsRequired();
                entity.HasMany(g => g.Members)
                    .WithOne(m => m.Group)
                    .HasForeignKey(m => m.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasMany(g => g.Messages)
                    .WithOne(msg => msg.Group)
                    .HasForeignKey(msg => msg.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<GroupMember>(entity =>
            {
                entity.HasKey(gm => gm.Id);
                entity.HasOne(gm => gm.Group)
                    .WithMany(g => g.Members)
                    .HasForeignKey(gm => gm.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(gm => gm.User)
                    .WithMany() 
                    .HasForeignKey(gm => gm.UserId)
                    .OnDelete(DeleteBehavior.NoAction); 
            });

            modelBuilder.Entity<GroupMessage>(entity =>
            {
                entity.HasKey(gm => gm.Id);
                entity.HasOne(gm => gm.Group)
                    .WithMany(g => g.Messages)
                    .HasForeignKey(gm => gm.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(gm => gm.Sender)
                    .WithMany(u => u.GroupMessagesSent)
                    .HasForeignKey(gm => gm.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.Property(gm => gm.Content).IsRequired();
            });

            modelBuilder.Entity<CommentLike>()
                .HasKey(cl => new { cl.CommentId, cl.UserId });

            // CHANGED: Comment -> CommentLike from Cascade to Restrict
            modelBuilder.Entity<CommentLike>()
                .HasOne(cl => cl.Comment)
                .WithMany(c => c.Likes)
                .HasForeignKey(cl => cl.CommentId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade to Restrict

            modelBuilder.Entity<CommentLike>()
                .HasOne(cl => cl.User)
                .WithMany(u => u.CommentLikes)
                .HasForeignKey(cl => cl.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PostLike>()
                .HasKey(pl => new { pl.PostId, pl.UserId });

            // CHANGED: Post -> PostLike from Cascade to Restrict  
            modelBuilder.Entity<PostLike>()
                .HasOne(pl => pl.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(pl => pl.PostId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade to Restrict

            modelBuilder.Entity<PostLike>()
                .HasOne(pl => pl.User)
                .WithMany(u => u.PostLikes)
                .HasForeignKey(pl => pl.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.NoAction); 

            modelBuilder.Entity<Post>(entity =>
            {
                entity.HasKey(p => p.PostId);
                entity.Property(p => p.Description).IsRequired();
                entity.Property(p => p.MediaType).HasConversion<string>().IsRequired();
                entity.HasOne(p => p.User)
                    .WithMany(u => u.Posts)
                    .HasForeignKey(p => p.UserId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Cascade); 
            });

            modelBuilder.Entity<PostHumor>(entity =>
            {
                entity.HasKey(ph => ph.PostHumorId);
                entity.HasOne(ph => ph.Post)
                    .WithMany(p => p.PostHumors)
                    .HasForeignKey(ph => ph.PostId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(ph => ph.HumorType)
                    .WithMany(ht => ht.PostHumors)
                    .HasForeignKey(ph => ph.HumorTypeId)
                    .OnDelete(DeleteBehavior.Cascade);
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
                entity.HasIndex(fr => new { fr.SenderId, fr.ReceiverId })
                    .IsUnique()
                    .HasFilter($"[Status] = '{FriendRequestStatus.Pending}'");
            });

            modelBuilder.Entity<UserHumorType>()
                .HasKey(uht => new { uht.UserId, uht.HumorTypeId });

            modelBuilder.Entity<UserHumorType>()
                .HasOne(uht => uht.User)
                .WithMany(u => u.UserHumorTypes)
                .HasForeignKey(uht => uht.UserId)
                .OnDelete(DeleteBehavior.Cascade); 

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

            modelBuilder.Entity<Friendship>(entity =>
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
                entity.HasIndex(e => new { e.User1Id, e.User2Id }).IsUnique();
            });

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserName)
                .IsUnique();

            modelBuilder.Entity<HumorType>()
                .HasIndex(ht => ht.HumorTypeName)
                .IsUnique();

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}