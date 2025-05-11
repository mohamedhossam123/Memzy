using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memzy_finalist.Migrations
{
    /// <inheritdoc />
    public partial class OptimizedRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friendship_Users_User1Id",
                table: "Friendship");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship");

            migrationBuilder.DropIndex(
                name: "IX_Friendship_User2Id",
                table: "Friendship");

            migrationBuilder.DropColumn(
                name: "CanMessage",
                table: "Friendship");

            migrationBuilder.CreateIndex(
                name: "IX_Friendship_User2Id_User1Id",
                table: "Friendship",
                columns: new[] { "User2Id", "User1Id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendship_Users_User1Id",
                table: "Friendship",
                column: "User1Id",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship",
                column: "User2Id",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friendship_Users_User1Id",
                table: "Friendship");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship");

            migrationBuilder.DropIndex(
                name: "IX_Friendship_User2Id_User1Id",
                table: "Friendship");

            migrationBuilder.AddColumn<bool>(
                name: "CanMessage",
                table: "Friendship",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Friendship_User2Id",
                table: "Friendship",
                column: "User2Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Friendship_Users_User1Id",
                table: "Friendship",
                column: "User1Id",
                principalTable: "Users",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Friendship_Users_User2Id",
                table: "Friendship",
                column: "User2Id",
                principalTable: "Users",
                principalColumn: "UserId");
        }
    }
}
