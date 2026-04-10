namespace DieticianAssociation.API.Data.Seeders
{
    public static class UserSeeder
    {
        public static async Task Seed(ApplicationDbContext context)
        {
            await SeedUser(
                context,
                id: "superadmin-001",
                email: "superadmin@dieticianassoc.in",
                name: "Super Admin User",
                role: UserRole.SuperAdmin,
                password: "SuperAdmin@123"
            );

            await SeedUser(
                context,
                id: "admin-001",
                email: "admin@dieticianassoc.in",
                name: "Admin User",
                role: UserRole.Admin,
                password: "Admin@123"
            );

            await SeedUser(
                context,
                id: "student-001",
                email: "student@dieticianassoc.in",
                name: "Student User",
                role: UserRole.Student,
                password: "Student@123"
            );

            await context.SaveChangesAsync();
        }

        private static async Task SeedUser(
            ApplicationDbContext context,
            string id,
            string email,
            string name,
            UserRole role,
            string password)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Id == id || u.Email == email);

            if (user == null)
            {
                context.Users.Add(new User
                {
                    Id = id,
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                    Name = name,
                    Role = role,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    JoinDate = DateTime.UtcNow
                });
            }
            else
            {
                // Optional: ensure role is correct without breaking prod
                user.Role = role;
                user.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
