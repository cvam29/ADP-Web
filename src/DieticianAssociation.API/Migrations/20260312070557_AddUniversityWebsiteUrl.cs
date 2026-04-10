using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DieticianAssociation.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUniversityWebsiteUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                table: "Universities",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                table: "Universities");
        }
    }
}
