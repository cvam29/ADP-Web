using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DieticianAssociation.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEducationCollegeFieldsAndUniversityRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Colleges_CollegeTypes_CollegeTypeId",
                table: "Colleges");

            migrationBuilder.DropIndex(
                name: "IX_Colleges_CollegeTypeId",
                table: "Colleges");

            migrationBuilder.DropColumn(
                name: "Address1",
                table: "Colleges");

            migrationBuilder.DropColumn(
                name: "CollegeTypeId",
                table: "Colleges");

            migrationBuilder.DropColumn(
                name: "InstitutionType",
                table: "Colleges");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Colleges");

            migrationBuilder.DropColumn(
                name: "Management",
                table: "Colleges");

            migrationBuilder.DropColumn(
                name: "SpecializedIn",
                table: "Colleges");

            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "Universities",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Universities");

            migrationBuilder.AddColumn<string>(
                name: "Address1",
                table: "Colleges",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CollegeTypeId",
                table: "Colleges",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "InstitutionType",
                table: "Colleges",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Colleges",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Management",
                table: "Colleges",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpecializedIn",
                table: "Colleges",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Colleges_CollegeTypeId",
                table: "Colleges",
                column: "CollegeTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Colleges_CollegeTypes_CollegeTypeId",
                table: "Colleges",
                column: "CollegeTypeId",
                principalTable: "CollegeTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
