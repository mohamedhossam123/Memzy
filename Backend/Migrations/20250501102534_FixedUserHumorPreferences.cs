using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memzy_finalist.Migrations
{
    /// <inheritdoc />
    public partial class FixedUserHumorPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_UserHumorPreferences",
                table: "UserHumorPreferences");

            migrationBuilder.DropIndex(
                name: "IX_UserHumorPreferences_UserId",
                table: "UserHumorPreferences");

            migrationBuilder.DropColumn(
                name: "UserHumorPreferenceId",
                table: "UserHumorPreferences");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserHumorPreferences",
                table: "UserHumorPreferences",
                columns: new[] { "UserId", "HumorTypeId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_UserHumorPreferences",
                table: "UserHumorPreferences");

            migrationBuilder.AddColumn<int>(
                name: "UserHumorPreferenceId",
                table: "UserHumorPreferences",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserHumorPreferences",
                table: "UserHumorPreferences",
                column: "UserHumorPreferenceId");

            migrationBuilder.CreateIndex(
                name: "IX_UserHumorPreferences_UserId",
                table: "UserHumorPreferences",
                column: "UserId");
        }
    }
}
