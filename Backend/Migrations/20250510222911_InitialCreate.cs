using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memzy_finalist.Migrations
{
   public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Remove existing foreign keys if they exist
        migrationBuilder.Sql(@"
            IF OBJECT_ID('FK_Friendship_Users_User1Id', 'F') IS NOT NULL
            ALTER TABLE Friendships DROP CONSTRAINT FK_Friendship_Users_User1Id;
            
            IF OBJECT_ID('FK_Friendship_Users_User2Id', 'F') IS NOT NULL
            ALTER TABLE Friendships DROP CONSTRAINT FK_Friendship_Users_User2Id;
        ");

        // Add new foreign keys with NO ACTION
        migrationBuilder.Sql(@"
            ALTER TABLE Friendships 
            ADD CONSTRAINT FK_Friendship_Users_User1Id 
            FOREIGN KEY (User1Id) REFERENCES Users(UserId) ON DELETE NO ACTION;
            
            ALTER TABLE Friendships 
            ADD CONSTRAINT FK_Friendship_Users_User2Id 
            FOREIGN KEY (User2Id) REFERENCES Users(UserId) ON DELETE NO ACTION;
        ");

        // Add trigger
        migrationBuilder.Sql(@"
            CREATE TRIGGER TR_User_Delete_Friendships
            ON Users
            INSTEAD OF DELETE
            AS
            BEGIN
                SET NOCOUNT ON;
                DELETE FROM Friendships WHERE User1Id IN (SELECT UserId FROM deleted);
                DELETE FROM Friendships WHERE User2Id IN (SELECT UserId FROM deleted);
                DELETE FROM Users WHERE UserId IN (SELECT UserId FROM deleted);
            END
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DROP TRIGGER TR_User_Delete_Friendships");
        migrationBuilder.Sql(@"
            ALTER TABLE Friendships DROP CONSTRAINT FK_Friendship_Users_User1Id;
            ALTER TABLE Friendships DROP CONSTRAINT FK_Friendship_Users_User2Id;
        ");
    }
}
}
