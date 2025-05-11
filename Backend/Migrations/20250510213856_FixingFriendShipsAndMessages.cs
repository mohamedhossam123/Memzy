using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memzy_finalist.Migrations
{
    /// <inheritdoc />
    public partial class FixingFriendShipsAndMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship");

            migrationBuilder.DropIndex(
                name: "IX_Friendship_User1Id_User2Id",
                table: "Friendship");

            migrationBuilder.DropIndex(
                name: "IX_Friendship_User2Id_User1Id",
                table: "Friendship");

            migrationBuilder.CreateIndex(
                name: "IX_Friendship_User1Id",
                table: "Friendship",
                column: "User1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Friendship_User2Id",
                table: "Friendship",
                column: "User2Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship",
                column: "User2Id",
                principalTable: "Users",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship");

            migrationBuilder.DropIndex(
                name: "IX_Friendship_User1Id",
                table: "Friendship");

            migrationBuilder.DropIndex(
                name: "IX_Friendship_User2Id",
                table: "Friendship");

            migrationBuilder.CreateIndex(
                name: "IX_Friendship_User1Id_User2Id",
                table: "Friendship",
                columns: new[] { "User1Id", "User2Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Friendship_User2Id_User1Id",
                table: "Friendship",
                columns: new[] { "User2Id", "User1Id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship",
                column: "User2Id",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
