#nullable disable

namespace DieticianAssociation.API.Migrations
{
    /// <inheritdoc />
    public partial class FixPaymentTransactionRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_EventRegistrations_RegistrationId1",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentTransactions_RegistrationId1",
                table: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "RegistrationId1",
                table: "PaymentTransactions");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_RegistrationId",
                table: "PaymentTransactions",
                column: "RegistrationId");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_EventRegistrations_RegistrationId",
                table: "PaymentTransactions",
                column: "RegistrationId",
                principalTable: "EventRegistrations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_EventRegistrations_RegistrationId",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentTransactions_RegistrationId",
                table: "PaymentTransactions");

            migrationBuilder.AddColumn<string>(
                name: "RegistrationId1",
                table: "PaymentTransactions",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_RegistrationId1",
                table: "PaymentTransactions",
                column: "RegistrationId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_EventRegistrations_RegistrationId1",
                table: "PaymentTransactions",
                column: "RegistrationId1",
                principalTable: "EventRegistrations",
                principalColumn: "Id");
        }
    }
}
