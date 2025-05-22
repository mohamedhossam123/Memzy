using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Memzy_finalist.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    // First check if column exists
    migrationBuilder.Sql(@"
        IF NOT EXISTS (SELECT * FROM sys.columns 
                      WHERE object_id = OBJECT_ID('Users') 
                      AND name = 'UserName')
        BEGIN
            ALTER TABLE Users ADD UserName NVARCHAR(50) NULL;
            
            UPDATE Users 
            SET UserName = 'user_' + CAST(UserId AS NVARCHAR) + '_' + LEFT(REPLACE(Name, ' ', '_'), 10)
            WHERE UserName IS NULL;
            
            ALTER TABLE Users ALTER COLUMN UserName NVARCHAR(50) NOT NULL;
        END
    ");

    // Only create index if it doesn't exist
    migrationBuilder.Sql(@"
        IF NOT EXISTS (SELECT * FROM sys.indexes 
                      WHERE name = 'IX_Users_UserName' AND object_id = OBJECT_ID('Users'))
        BEGIN
            CREATE UNIQUE INDEX IX_Users_UserName ON Users(UserName);
        END
    ");
}
    }
}
