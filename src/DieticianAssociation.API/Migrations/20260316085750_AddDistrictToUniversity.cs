using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DieticianAssociation.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDistrictToUniversity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DistrictId",
                table: "Universities",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Universities_DistrictId",
                table: "Universities",
                column: "DistrictId");

            migrationBuilder.AddForeignKey(
                name: "FK_Universities_Districts_DistrictId",
                table: "Universities",
                column: "DistrictId",
                principalTable: "Districts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Universities_Districts_DistrictId",
                table: "Universities");

            migrationBuilder.DropIndex(
                name: "IX_Universities_DistrictId",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "DistrictId",
                table: "Universities");
        }
    }
}
