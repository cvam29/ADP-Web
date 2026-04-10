namespace DieticianAssociation.API.Data.Seeders;

public static class GeoSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        IWebHostEnvironment env,
        ILogger logger)
    {
        var basePath = Path.Combine(env.ContentRootPath, "Data", "Seeders", "sql");
        var regionsSeeded = await context.Regions.AnyAsync();
        var subRegionsSeeded = await context.SubRegions.AnyAsync();
        var countriesSeeded = await context.Countries.AnyAsync();
        var statesSeeded = await context.States.AnyAsync();
        var citiesSeeded = await context.Cities.AnyAsync();
        var districtsSeeded = await context.Districts.AnyAsync();

        if (regionsSeeded && subRegionsSeeded && countriesSeeded && statesSeeded && citiesSeeded && districtsSeeded)
        {
            logger.LogInformation("Geo data already seeded.");
            return;
        }

        if (!regionsSeeded)
            await ExecuteSql(context, Path.Combine(basePath, "regions.sql"), logger);

        if (!subRegionsSeeded)
            await ExecuteSql(context, Path.Combine(basePath, "subregions.sql"), logger);

        if (!countriesSeeded)
            await ExecuteSql(context, Path.Combine(basePath, "countries.sql"), logger);

        if (!statesSeeded)
            await ExecuteSql(context, Path.Combine(basePath, "states.sql"), logger);

        if (!citiesSeeded)
            await ExecuteSql(context, Path.Combine(basePath, "cities.sql"), logger);

        if (!districtsSeeded)
            await ExecuteSql(context, Path.Combine(basePath, "districts.sql"), logger);

        logger.LogInformation("Geo data seeded successfully.");
    }

    private static async Task ExecuteSql(
        ApplicationDbContext context,
        string filePath,
        ILogger logger)
    {
        if (!File.Exists(filePath))
        {
            logger.LogWarning("SQL file not found: {File}", filePath);
            return;
        }

        var sql = await File.ReadAllTextAsync(filePath);
        await context.Database.ExecuteSqlRawAsync(
        PrepareSql(sql));


        //await context.Database.ExecuteSqlRawAsync(sql);

        logger.LogInformation("Executed seed file: {File}", Path.GetFileName(filePath));
    }

    private static string PrepareSql(string sql)
    {
        return sql.Replace("{", "{{").Replace("}", "}}");
    }

}
