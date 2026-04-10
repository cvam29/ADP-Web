namespace DieticianAssociation.API.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{

    // DbSets
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<MembershipPlan> MembershipPlans { get; set; } = null!;
    public DbSet<BlogPost> BlogPosts { get; set; } = null!;
    public DbSet<Event> AssociationEvents { get; set; } = null!;
    public DbSet<Resource> Resources { get; set; } = null!;
    public DbSet<ContactMessage> ContactMessages { get; set; } = null!;
    public DbSet<Testimonial> Testimonials { get; set; } = null!;
    public DbSet<UserMembership> UserMemberships { get; set; }   // ✅ new table
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<UserPermissionAssignment> UserPermissionAssignments { get; set; } = null!;
    public DbSet<MembershipPlanPermission> MembershipPlanPermissions { get; set; } = null!;
    public DbSet<Address> Addresses { get; set; }
    public DbSet<EducationQualification> EducationQualifications { get; set; }
    public DbSet<PaymentRecord> PaymentRecords { get; set; }
    public DbSet<UserConsent> UserConsents { get; set; }
    public DbSet<EmailTemplate> EmailTemplates { get; set; } = null!;


    //Geo Tables

    public DbSet<Region> Regions { get; set; } = null!;
    public DbSet<SubRegion> SubRegions { get; set; } = null!;
    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<State> States { get; set; } = null!;
    public DbSet<City> Cities { get; set; } = null!;
    public DbSet<District> Districts { get; set; } = null!;

    // Education Tables
    public DbSet<University> Universities { get; set; } = null!;
    public DbSet<CollegeType> CollegeTypes { get; set; } = null!;
    public DbSet<College> Colleges { get; set; } = null!;



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();

            // Configure enum to integer conversions for custom properties
            entity.Property(e => e.Role)
                .HasConversion(
                    v => (int)v,
                    v => (UserRole)v
                );

            entity.HasMany(e => e.PermissionAssignments)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            // Configure list properties as JSON
            entity.Property(e => e.Specializations)
                .HasConversion(
                    v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null)
                )
                .Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>?>(
                    (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && c1.SequenceEqual(c2)),
                    c => c == null ? 0 : c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c == null ? new List<string>() : c.ToList()));

            modelBuilder.Entity<User>()
        .HasQueryFilter(u => !u.IsDeleted);

            modelBuilder.Entity<BlogPost>()
        .HasQueryFilter(b => b.Author != null && !b.Author.IsDeleted);

            modelBuilder.Entity<UserMembership>()
                .HasQueryFilter(m => m.User != null && !m.User.IsDeleted);

            // Matching query filters for entities with required User relationships
            modelBuilder.Entity<Address>()
                .HasQueryFilter(a => !a.IsDeleted && a.User != null && !a.User.IsDeleted);

            modelBuilder.Entity<EducationQualification>()
                .HasQueryFilter(e => !e.IsDeleted && e.User != null && !e.User.IsDeleted);

            modelBuilder.Entity<PaymentRecord>()
                .HasQueryFilter(p => p.User != null && !p.User.IsDeleted);

            modelBuilder.Entity<Testimonial>()
                .HasQueryFilter(t => t.SubmittedBy != null && !t.SubmittedBy.IsDeleted);

            modelBuilder.Entity<UserConsent>()
                .HasQueryFilter(c => c.User != null && !c.User.IsDeleted);

            modelBuilder.Entity<UserPermissionAssignment>()
                .HasQueryFilter(a => !a.User.IsDeleted);
        });

        // Configure MembershipPlan entity
        modelBuilder.Entity<MembershipPlan>(entity =>
        {
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.InitialFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.RenewalFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountedPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountedRenewalFee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PriceWithGST).HasColumnType("decimal(18,2)");
            entity.Property(e => e.RenewalPriceWithGST).HasColumnType("decimal(18,2)");

            // Configure list properties as JSON (MembershipPlan.Features is already seeded as JSON)
            entity.Property(e => e.Features)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                )
                .Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                    (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && c1.SequenceEqual(c2)),
                    c => c == null ? 0 : c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c == null ? new List<string>() : c.ToList()));

            entity.HasMany(e => e.PlanPermissions)
                .WithOne(e => e.MembershipPlan)
                .HasForeignKey(e => e.MembershipPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Key).IsUnique();
            entity.Property(e => e.Key).HasMaxLength(120).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(160).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category).HasMaxLength(80).IsRequired();
        });

        modelBuilder.Entity<UserPermissionAssignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.PermissionId }).IsUnique();
            entity.Property(e => e.Effect)
                .HasConversion(
                    value => (int)value,
                    value => (PermissionAssignmentEffect)value);
        });

        modelBuilder.Entity<MembershipPlanPermission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.MembershipPlanId, e.PermissionId }).IsUnique();
        });

        // Configure other List<string> properties to be ignored temporarily to avoid PostgreSQL mapping issues
        // These will be converted to proper JSON format in a future database migration
        modelBuilder.Entity<BlogPost>(entity =>
        {
            entity.Ignore(e => e.Tags);

            // Explicit User-BlogPost relationship
            entity.HasOne(e => e.Author)
                .WithMany(u => u.BlogPosts)
                .HasForeignKey(e => e.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Useful indexes
            entity.HasIndex(e => e.Url).IsUnique(true);
            entity.HasIndex(e => e.AuthorId);
            entity.HasIndex(e => e.PreviousUrl);
            entity.HasIndex(e => new { e.IsPublished, e.PublishedDate });
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Url).IsRequired();
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Url).IsRequired();
            entity.HasIndex(e => e.Url).IsUnique();
            entity.HasIndex(e => e.Date);

            // Configure many-to-many relationship between Event and User for Speakers
            entity.HasMany(e => e.Speakers)
                  .WithMany()
                  .UsingEntity<Dictionary<string, object>>(
                      "EventSpeakers",
                      j => j.HasOne<User>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade),
                      j => j.HasOne<Event>().WithMany().HasForeignKey("EventId").OnDelete(DeleteBehavior.Cascade),
                      j =>
                      {
                          j.HasKey("EventId", "UserId");
                          j.ToTable("EventSpeakers");
                      });

            // Store Images as JSON
            entity.Property(e => e.Images)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                    (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && c1.SequenceEqual(c2)),
                    c => c == null ? 0 : c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c == null ? new List<string>() : c.ToList()));
        });

        modelBuilder.Entity<Testimonial>(entity =>
        {
            entity.Property(e => e.Content).IsRequired().HasMaxLength(3000);
            entity.Property(e => e.MemberName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ProfessionalTitle).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PhotoUrl).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue(TestimonialStatuses.Pending);
            entity.Property(e => e.RejectionReason).HasMaxLength(1000);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.SubmittedByUserId);
            entity.HasIndex(e => e.SubmittedAt);
            entity.HasIndex(e => new { e.Status, e.IsFeatured, e.SubmittedAt });

            entity.HasOne(e => e.SubmittedBy)
                .WithMany()
                .HasForeignKey(e => e.SubmittedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReviewedBy)
                .WithMany()
                .HasForeignKey(e => e.ReviewedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });


        // Optional: configure relationships explicitly
        modelBuilder.Entity<UserMembership>(entity =>
        {
            entity.HasIndex(um => um.ApplicationRequestId).IsUnique();
            entity.Property(um => um.ApplicationRequestId).HasMaxLength(32).IsRequired();

            entity.HasOne(um => um.User)
                .WithMany(u => u.Memberships)
                .HasForeignKey(um => um.UserId);

            entity.HasOne(um => um.MembershipPlan)
                .WithMany(mp => mp.UserMemberships)
                .HasForeignKey(um => um.MembershipPlanId);
        });

        modelBuilder.Entity<UserPermissionAssignment>()
            .HasOne(assignment => assignment.Permission)
            .WithMany(permission => permission.UserAssignments)
            .HasForeignKey(assignment => assignment.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MembershipPlanPermission>()
            .HasOne(assignment => assignment.Permission)
            .WithMany(permission => permission.MembershipPlanAssignments)
            .HasForeignKey(assignment => assignment.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed data will be added here if needed


        modelBuilder.Entity<Region>().ToTable("regions");
        modelBuilder.Entity<SubRegion>().ToTable("subregions");
        modelBuilder.Entity<Country>().ToTable("countries");
        modelBuilder.Entity<State>().ToTable("states");
        modelBuilder.Entity<City>().ToTable("cities");

        modelBuilder.Entity<SubRegion>()
            .HasOne(x => x.Region)
            .WithMany(x => x.SubRegions)
            .HasForeignKey(x => x.RegionId);

        modelBuilder.Entity<State>()
            .HasOne(x => x.Country)
            .WithMany(x => x.States)
            .HasForeignKey(x => x.CountryId);



        modelBuilder.Entity<City>()
            .HasOne(x => x.State)
            .WithMany(x => x.Cities)
            .HasForeignKey(x => x.StateId);

        modelBuilder.Entity<City>()
            .HasOne(x => x.Country)
            .WithMany(x => x.Cities)
            .HasForeignKey(x => x.CountryId);

        modelBuilder.Entity<Address>()
    .HasIndex(a => new { a.UserId, a.IsPrimary });

        modelBuilder.Entity<Address>()
            .HasOne(a => a.Country)
            .WithMany()
            .HasForeignKey(a => a.CountryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Address>()
            .HasOne(a => a.State)
            .WithMany()
            .HasForeignKey(a => a.StateId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Address>()
            .HasOne(a => a.City)
            .WithMany()
            .HasForeignKey(a => a.CityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EducationQualification>()
    .HasIndex(e => new { e.UserId, e.Level })
    .IsUnique();

        // Configure District entity
        modelBuilder.Entity<District>()
            .HasOne(d => d.State)
            .WithMany()
            .HasForeignKey(d => d.StateId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure University entity
        modelBuilder.Entity<University>()
            .HasOne(u => u.State)
            .WithMany()
            .HasForeignKey(u => u.StateId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<University>()
            .HasIndex(u => u.UniversityCode)
            .IsUnique();

        modelBuilder.Entity<University>()
            .Property(u => u.Rating)
            .HasDefaultValue(0);

        // Configure College entity
        modelBuilder.Entity<College>()
            .HasOne(c => c.University)
            .WithMany(u => u.Colleges)
            .HasForeignKey(c => c.UniversityId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<College>()
            .HasOne(c => c.State)
            .WithMany()
            .HasForeignKey(c => c.StateId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<College>()
            .HasOne(c => c.District)
            .WithMany(d => d.Colleges)
            .HasForeignKey(c => c.DistrictId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<College>()
            .HasIndex(c => c.AisheCode)
            .IsUnique();

        modelBuilder.Entity<EmailTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Key).IsUnique();
            entity.Property(e => e.Key).HasMaxLength(120).IsRequired();
            entity.Property(e => e.Subject).HasMaxLength(300).IsRequired();
            entity.Property(e => e.HtmlBody).IsRequired();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<ContactMessage>(entity =>
        {
            entity.HasIndex(e => new { e.Status, e.CreatedAt });
        });

    }
}
