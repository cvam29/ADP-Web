using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DieticianAssociation.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMembershipApplicationRequestId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationRequestId",
                table: "UserMemberships",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE ""UserMemberships""
                SET ""ApplicationRequestId"" = 'ADP-REQ-' || to_char(""CreatedAt"", 'YYYYMMDD') || '-' || upper(substr(replace(""Id"", '-', ''), 1, 8))
                WHERE ""ApplicationRequestId"" IS NULL;
            ");

            migrationBuilder.AlterColumn<string>(
                name: "ApplicationRequestId",
                table: "UserMemberships",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserMemberships_ApplicationRequestId",
                table: "UserMemberships",
                column: "ApplicationRequestId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserMemberships_ApplicationRequestId",
                table: "UserMemberships");

            migrationBuilder.DropColumn(
                name: "ApplicationRequestId",
                table: "UserMemberships");
        }
    }
}
