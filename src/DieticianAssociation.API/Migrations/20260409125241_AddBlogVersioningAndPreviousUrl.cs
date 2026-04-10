using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DieticianAssociation.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBlogVersioningAndPreviousUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EditStatus",
                table: "BlogPosts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PendingCategory",
                table: "BlogPosts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PendingContent",
                table: "BlogPosts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PendingExcerpt",
                table: "BlogPosts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PendingImage",
                table: "BlogPosts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PendingReadTime",
                table: "BlogPosts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PendingTitle",
                table: "BlogPosts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreviousUrl",
                table: "BlogPosts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "BlogPosts",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EditStatus",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "PendingCategory",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "PendingContent",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "PendingExcerpt",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "PendingImage",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "PendingReadTime",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "PendingTitle",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "PreviousUrl",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "BlogPosts");
        }
    }
}
