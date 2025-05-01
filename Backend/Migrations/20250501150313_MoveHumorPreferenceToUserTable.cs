using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memzy_finalist.Migrations
{
    /// <inheritdoc />
    public partial class MoveHumorPreferenceToUserTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserHumorPreferences");

            migrationBuilder.AddColumn<int>(
                name: "HumorTypeId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_HumorTypeId",
                table: "Users",
                column: "HumorTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_HumorTypes_HumorTypeId",
                table: "Users",
                column: "HumorTypeId",
                principalTable: "HumorTypes",
                principalColumn: "HumorTypeId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_HumorTypes_HumorTypeId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_HumorTypeId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "HumorTypeId",
                table: "Users");

            migrationBuilder.CreateTable(
                name: "UserHumorPreferences",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    HumorTypeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHumorPreferences", x => new { x.UserId, x.HumorTypeId });
                    table.ForeignKey(
                        name: "FK_UserHumorPreferences_HumorTypes_HumorTypeId",
                        column: x => x.HumorTypeId,
                        principalTable: "HumorTypes",
                        principalColumn: "HumorTypeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserHumorPreferences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserHumorPreferences_HumorTypeId",
                table: "UserHumorPreferences",
                column: "HumorTypeId");
        }
    }
}
