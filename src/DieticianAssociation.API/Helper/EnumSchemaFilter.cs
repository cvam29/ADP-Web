namespace DieticianAssociation.API.Helper;

public class EnumSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (!context.Type.IsEnum) return;

        var names = Enum.GetNames(context.Type);
        var values = Enum.GetValues(context.Type).Cast<int>().ToArray();

        schema.Type = "integer";   // make sure Swagger knows it's numeric
        schema.Format = "int32";

        schema.Enum.Clear();

        for (int i = 0; i < names.Length; i++)
        {
            schema.Enum.Add(new OpenApiInteger(values[i]));
        }

        // Extra metadata for Orval/NSwag
        var varNames = new OpenApiArray();
        var varValues = new OpenApiArray();

        for (int i = 0; i < names.Length; i++)
        {
            var camel = char.ToLowerInvariant(names[i][0]) + names[i][1..];
            varNames.Add(new OpenApiString(camel));
            varValues.Add(new OpenApiInteger(values[i]));
        }

        schema.Extensions["x-enum-varnames"] = varNames;
        schema.Extensions["x-enum-values"] = varValues;
    }
}
