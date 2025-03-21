﻿// <auto-generated />
using System;
using Memzy_finalist.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Memzy_finalist.Migrations
{
    [DbContext(typeof(MemzyContext))]
    [Migration("20250321142119_THIS_SHOUKD_ADD_STATUS_")]
    partial class THIS_SHOUKD_ADD_STATUS_
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Memzy_finalist.Models.Friend", b =>
                {
                    b.Property<int>("FriendshipId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("FriendshipID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("FriendshipId"));

                    b.Property<bool?>("CanMessage")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bit")
                        .HasDefaultValueSql("((1))");

                    b.Property<DateTime?>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<int>("User1Id")
                        .HasColumnType("int")
                        .HasColumnName("User1ID");

                    b.Property<int>("User2Id")
                        .HasColumnType("int")
                        .HasColumnName("User2ID");

                    b.HasKey("FriendshipId")
                        .HasName("PK__Friends__4D531A741AE81307");

                    b.HasIndex("User1Id");

                    b.HasIndex("User2Id");

                    b.ToTable("Friends");
                });

            modelBuilder.Entity("Memzy_finalist.Models.FriendRequest", b =>
                {
                    b.Property<int>("RequestId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("RequestID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("RequestId"));

                    b.Property<DateTime?>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<int>("ReceiverId")
                        .HasColumnType("int")
                        .HasColumnName("ReceiverID");

                    b.Property<int>("SenderId")
                        .HasColumnType("int")
                        .HasColumnName("SenderID");

                    b.Property<string>("Status")
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)")
                        .HasDefaultValueSql("('Pending')");

                    b.HasKey("RequestId")
                        .HasName("PK__FriendRe__33A8519A14A7B6E0");

                    b.HasIndex("ReceiverId");

                    b.HasIndex("SenderId");

                    b.ToTable("FriendRequests");
                });

            modelBuilder.Entity("Memzy_finalist.Models.HumorType", b =>
                {
                    b.Property<int>("HumorTypeId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("HumorTypeID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("HumorTypeId"));

                    b.Property<string>("HumorTypeName")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.HasKey("HumorTypeId");

                    b.HasIndex(new[] { "HumorTypeName" }, "UQ__HumorTyp__1C1846CC09601AAA")
                        .IsUnique();

                    b.ToTable("HumorTypes");
                });

            modelBuilder.Entity("Memzy_finalist.Models.Image", b =>
                {
                    b.Property<int>("ImageId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("ImageID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ImageId"));

                    b.Property<DateTime?>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<string>("Description")
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<string>("ImageUrl")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)")
                        .HasColumnName("ImageURL");

                    b.Property<int>("UserId")
                        .HasColumnType("int")
                        .HasColumnName("UserID");

                    b.Property<int>("image_like_counter")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasDefaultValue(0)
                        .HasColumnName("Likes");

                    b.HasKey("ImageId");

                    b.HasIndex("UserId");

                    b.ToTable("Images");
                });

            modelBuilder.Entity("Memzy_finalist.Models.Message", b =>
                {
                    b.Property<int>("MessageId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("MessageID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("MessageId"));

                    b.Property<string>("MessageText")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("nvarchar(1000)");

                    b.Property<int>("ReceiverId")
                        .HasColumnType("int")
                        .HasColumnName("ReceiverID");

                    b.Property<int>("SenderId")
                        .HasColumnType("int")
                        .HasColumnName("SenderID");

                    b.Property<DateTime?>("SentAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.HasKey("MessageId");

                    b.HasIndex("ReceiverId");

                    b.HasIndex("SenderId");

                    b.ToTable("Messages");
                });

            modelBuilder.Entity("Memzy_finalist.Models.User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("UserID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserId"));

                    b.Property<string>("Bio")
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)")
                        .HasColumnName("BIO");

                    b.Property<DateTime?>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<string>("ProfilePictureUrl")
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)")
                        .HasColumnName("ProfilePictureURL");

                    b.Property<string>("status_")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("nvarchar(max)")
                        .HasDefaultValue("normal");

                    b.HasKey("UserId");

                    b.HasIndex(new[] { "Email" }, "UQ__Users__A9D10534C32BF4C8")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Memzy_finalist.Models.UserHumor", b =>
                {
                    b.Property<int>("UserHumorId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("UserHumorID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserHumorId"));

                    b.Property<int>("HumorTypeId")
                        .HasColumnType("int")
                        .HasColumnName("HumorTypeID");

                    b.Property<int>("UserId")
                        .HasColumnType("int")
                        .HasColumnName("UserID");

                    b.HasKey("UserHumorId");

                    b.HasIndex("HumorTypeId");

                    b.HasIndex("UserId");

                    b.ToTable("UserHumor", (string)null);
                });

            modelBuilder.Entity("Memzy_finalist.Models.Video", b =>
                {
                    b.Property<int>("VideoId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("VideoID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("VideoId"));

                    b.Property<DateTime?>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<string>("Description")
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<int>("UserId")
                        .HasColumnType("int")
                        .HasColumnName("UserID");

                    b.Property<string>("VideoUrl")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)")
                        .HasColumnName("VideoURL");

                    b.HasKey("VideoId");

                    b.HasIndex("UserId");

                    b.ToTable("Videos");
                });

            modelBuilder.Entity("Memzy_finalist.Models.Friend", b =>
                {
                    b.HasOne("Memzy_finalist.Models.User", "User1")
                        .WithMany("FriendUser1s")
                        .HasForeignKey("User1Id")
                        .IsRequired()
                        .HasConstraintName("FK__Friends__User1ID__5AB9788F");

                    b.HasOne("Memzy_finalist.Models.User", "User2")
                        .WithMany("FriendUser2s")
                        .HasForeignKey("User2Id")
                        .IsRequired()
                        .HasConstraintName("FK__Friends__User2ID__5BAD9CC8");

                    b.Navigation("User1");

                    b.Navigation("User2");
                });

            modelBuilder.Entity("Memzy_finalist.Models.FriendRequest", b =>
                {
                    b.HasOne("Memzy_finalist.Models.User", "Receiver")
                        .WithMany("FriendRequestReceivers")
                        .HasForeignKey("ReceiverId")
                        .IsRequired()
                        .HasConstraintName("FK__FriendReq__Recei__625A9A57");

                    b.HasOne("Memzy_finalist.Models.User", "Sender")
                        .WithMany("FriendRequestSenders")
                        .HasForeignKey("SenderId")
                        .IsRequired()
                        .HasConstraintName("FK__FriendReq__Sende__6166761E");

                    b.Navigation("Receiver");

                    b.Navigation("Sender");
                });

            modelBuilder.Entity("Memzy_finalist.Models.Image", b =>
                {
                    b.HasOne("Memzy_finalist.Models.User", "User")
                        .WithMany("Images")
                        .HasForeignKey("UserId")
                        .IsRequired()
                        .HasConstraintName("FK__Images__UserID__55F4C372");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Memzy_finalist.Models.Message", b =>
                {
                    b.HasOne("Memzy_finalist.Models.User", "Receiver")
                        .WithMany("MessageReceivers")
                        .HasForeignKey("ReceiverId")
                        .IsRequired()
                        .HasConstraintName("FK__Messages__Receiv__671F4F74");

                    b.HasOne("Memzy_finalist.Models.User", "Sender")
                        .WithMany("MessageSenders")
                        .HasForeignKey("SenderId")
                        .IsRequired()
                        .HasConstraintName("FK__Messages__Sender__662B2B3B");

                    b.Navigation("Receiver");

                    b.Navigation("Sender");
                });

            modelBuilder.Entity("Memzy_finalist.Models.UserHumor", b =>
                {
                    b.HasOne("Memzy_finalist.Models.HumorType", "HumorType")
                        .WithMany("UserHumors")
                        .HasForeignKey("HumorTypeId")
                        .IsRequired()
                        .HasConstraintName("FK__UserHumor__Humor__4E53A1AA");

                    b.HasOne("Memzy_finalist.Models.User", "User")
                        .WithMany("UserHumors")
                        .HasForeignKey("UserId")
                        .IsRequired()
                        .HasConstraintName("FK__UserHumor__UserI__4D5F7D71");

                    b.Navigation("HumorType");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Memzy_finalist.Models.Video", b =>
                {
                    b.HasOne("Memzy_finalist.Models.User", "User")
                        .WithMany("Videos")
                        .HasForeignKey("UserId")
                        .IsRequired()
                        .HasConstraintName("FK__Videos__UserID__5224328E");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Memzy_finalist.Models.HumorType", b =>
                {
                    b.Navigation("UserHumors");
                });

            modelBuilder.Entity("Memzy_finalist.Models.User", b =>
                {
                    b.Navigation("FriendRequestReceivers");

                    b.Navigation("FriendRequestSenders");

                    b.Navigation("FriendUser1s");

                    b.Navigation("FriendUser2s");

                    b.Navigation("Images");

                    b.Navigation("MessageReceivers");

                    b.Navigation("MessageSenders");

                    b.Navigation("UserHumors");

                    b.Navigation("Videos");
                });
#pragma warning restore 612, 618
        }
    }
}
