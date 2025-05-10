using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memzy_finalist.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserHumorTypeRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.RenameColumn(
                name: "SentAt",
                table: "Messages",
                newName: "Timestamp");

            migrationBuilder.CreateTable(
                name: "UserHumorTypes",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    HumorTypeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHumorTypes", x => new { x.UserId, x.HumorTypeId });
                    table.ForeignKey(
                        name: "FK_UserHumorTypes_HumorTypes_HumorTypeId",
                        column: x => x.HumorTypeId,
                        principalTable: "HumorTypes",
                        principalColumn: "HumorTypeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserHumorTypes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserHumorTypes_HumorTypeId",
                table: "UserHumorTypes",
                column: "HumorTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserHumorTypes");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "Messages",
                newName: "SentAt");

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
    }
}
