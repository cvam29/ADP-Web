namespace DieticianAssociation.API.Data.Seeders
{
    public class CollegeTypeSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // Prevent duplicate seeding
            if (await context.CollegeTypes.AnyAsync())
                return;

            var collegeTypes = new List<CollegeType>
        {
            new() { Name = "Engineering" },
            new() { Name = "Medical" },
            new() { Name = "Arts" },
            new() { Name = "Science" },
            new() { Name = "Commerce" },
            new() { Name = "Management" },
            new() { Name = "Law" },
            new() { Name = "Education" }
        };

            await context.CollegeTypes.AddRangeAsync(collegeTypes);
            await context.SaveChangesAsync();
        }
    }
}
