using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memzy_finalist.Migrations
{
    /// <inheritdoc />
    public partial class FixCascadePaths : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        CREATE TRIGGER TR_User_Delete_Friendships
        ON Users
        INSTEAD OF DELETE
        AS
        BEGIN
            SET NOCOUNT ON;
            
            -- Delete friendships from both sides
            DELETE FROM Friendships 
            WHERE User1Id IN (SELECT UserId FROM deleted)
               OR User2Id IN (SELECT UserId FROM deleted);
            
            -- Delete the user
            DELETE FROM Users 
            WHERE UserId IN (SELECT UserId FROM deleted);
        END
    ");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendship_Users_User1Id",
                table: "Friendship");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Friendship",
                table: "Friendship");

            migrationBuilder.DropIndex(
                name: "IX_Friendship_User2Id",
                table: "Friendship");

            migrationBuilder.RenameTable(
                name: "Friendship",
                newName: "Friendships");

            migrationBuilder.RenameIndex(
                name: "IX_Friendship_User1Id_User2Id",
                table: "Friendships",
                newName: "IX_Friendships_User1Id_User2Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Friendships",
                table: "Friendships",
                column: "FriendshipId");

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_User2Id_User1Id",
                table: "Friendships",
                columns: new[] { "User2Id", "User1Id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_User1Id",
                table: "Friendships",
                column: "User1Id",
                principalTable: "Users",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_User2Id",
                table: "Friendships",
                column: "User2Id",
                principalTable: "Users",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User1Id",
                table: "Friendships");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User2Id",
                table: "Friendships");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Friendships",
                table: "Friendships");

            migrationBuilder.DropIndex(
                name: "IX_Friendships_User2Id_User1Id",
                table: "Friendships");

            migrationBuilder.RenameTable(
                name: "Friendships",
                newName: "Friendship");

            migrationBuilder.RenameIndex(
                name: "IX_Friendships_User1Id_User2Id",
                table: "Friendship",
                newName: "IX_Friendship_User1Id_User2Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Friendship",
                table: "Friendship",
                column: "FriendshipId");

            migrationBuilder.CreateIndex(
                name: "IX_Friendship_User2Id",
                table: "Friendship",
                column: "User2Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Friendship_Users_User1Id",
                table: "Friendship",
                column: "User1Id",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship",
                column: "User2Id",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
