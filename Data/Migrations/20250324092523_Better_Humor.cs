using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memzy_finalist.Migrations
{
    public partial class Better_Humor : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. First drop all constraints and indexes
            migrationBuilder.DropForeignKey(
                name: "FK__Friends__User1ID__5AB9788F",
                table: "Friends");

            migrationBuilder.DropIndex(
                name: "IX_Friends_User1ID",
                table: "Friends");

            // 2. Drop the primary key constraint first
            migrationBuilder.DropPrimaryKey(
                name: "PK__Friends__4D531A741AE81307",
                table: "Friends");

            // 3. Rename columns
            migrationBuilder.RenameColumn(
                name: "status_",
                table: "Users",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "UserHumorID",
                table: "UserHumor",
                newName: "UserHumorPreferenceId");

            // 4. Create temporary table to preserve data
            migrationBuilder.Sql(@"
                SELECT * INTO #TempFriends 
                FROM Friends;
                
                DROP TABLE Friends;
            ");

            // 5. Recreate table without identity
            migrationBuilder.Sql(@"
                CREATE TABLE [Friends] (
                    [FriendshipID] INT NOT NULL,
                    [User1ID] INT NOT NULL,
                    [User2ID] INT NOT NULL,
                    [TempFriendshipID] INT NOT NULL
                );
            ");

            // 6. Copy data back
            migrationBuilder.Sql(@"
                INSERT INTO Friends (FriendshipID, User1ID, User2ID, TempFriendshipID)
                SELECT FriendshipID, User1ID, User2ID, FriendshipID 
                FROM #TempFriends;
                
                DROP TABLE #TempFriends;
            ");

            // 7. Recreate constraints
            migrationBuilder.AddPrimaryKey(
                name: "PK_Friends",
                table: "Friends",
                column: "FriendshipID");

            migrationBuilder.CreateIndex(
                name: "IX_Friends_User1ID",
                table: "Friends",
                column: "User1ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Friends_Users_FriendshipID",
                table: "Friends",
                column: "FriendshipID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse the process for down migration
            migrationBuilder.DropForeignKey(
                name: "FK_Friends_Users_FriendshipID",
                table: "Friends");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Friends",
                table: "Friends");

            migrationBuilder.DropIndex(
                name: "IX_Friends_User1ID",
                table: "Friends");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Users",
                newName: "status_");

            migrationBuilder.RenameColumn(
                name: "UserHumorPreferenceId",
                table: "UserHumor",
                newName: "UserHumorID");

            // Recreate with identity
            migrationBuilder.Sql(@"
                SELECT * INTO #TempFriends 
                FROM Friends;
                
                DROP TABLE Friends;
                
                CREATE TABLE [Friends] (
                    [FriendshipID] INT IDENTITY(1,1) NOT NULL,
                    [User1ID] INT NOT NULL,
                    [User2ID] INT NOT NULL,
                    CONSTRAINT [PK__Friends__4D531A741AE81307] PRIMARY KEY ([FriendshipID])
                );
                
                SET IDENTITY_INSERT Friends ON;
                
                INSERT INTO Friends (FriendshipID, User1ID, User2ID)
                SELECT FriendshipID, User1ID, User2ID 
                FROM #TempFriends;
                
                SET IDENTITY_INSERT Friends OFF;
                
                DROP TABLE #TempFriends;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Friends_User1ID",
                table: "Friends",
                column: "User1ID");

            migrationBuilder.AddForeignKey(
                name: "FK__Friends__User1ID__5AB9788F",
                table: "Friends",
                column: "User1ID",
                principalTable: "Users",
                principalColumn: "UserID");
        }
    }
}