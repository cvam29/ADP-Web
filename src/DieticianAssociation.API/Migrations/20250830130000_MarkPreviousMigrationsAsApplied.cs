#nullable disable

namespace DieticianAssociation.API.Migrations
{
    /// <inheritdoc />
    public partial class MarkPreviousMigrationsAsApplied : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Mark the previous migrations as applied without executing their content
            // since the tables already exist
            migrationBuilder.Sql(@"
                INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                VALUES ('20250830125145_CreateUsersAndMembershipPlans', '8.0.11')
                ON CONFLICT (""MigrationId"") DO NOTHING;
                
                INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                VALUES ('20250830125206_CreateCoreTablesForNonIdentity', '8.0.11')
                ON CONFLICT (""MigrationId"") DO NOTHING;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove the migration records
            migrationBuilder.Sql(@"
                DELETE FROM ""__EFMigrationsHistory"" 
                WHERE ""MigrationId"" IN ('20250830125145_CreateUsersAndMembershipPlans', '20250830125206_CreateCoreTablesForNonIdentity');
            ");
        }
    }
}
