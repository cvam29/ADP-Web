using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DieticianAssociation.API.Migrations
{
    /// <inheritdoc />
    public partial class AddOptimalIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ContactMessages_Status_CreatedAt",
                table: "ContactMessages",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_IsPublished_PublishedDate",
                table: "BlogPosts",
                columns: new[] { "IsPublished", "PublishedDate" });

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_PreviousUrl",
                table: "BlogPosts",
                column: "PreviousUrl");

            migrationBuilder.CreateIndex(
                name: "IX_AssociationEvents_Date",
                table: "AssociationEvents",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ContactMessages_Status_CreatedAt",
                table: "ContactMessages");

            migrationBuilder.DropIndex(
                name: "IX_BlogPosts_IsPublished_PublishedDate",
                table: "BlogPosts");

            migrationBuilder.DropIndex(
                name: "IX_BlogPosts_PreviousUrl",
                table: "BlogPosts");

            migrationBuilder.DropIndex(
                name: "IX_AssociationEvents_Date",
                table: "AssociationEvents");
        }
    }
}
