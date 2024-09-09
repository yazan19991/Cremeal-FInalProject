using Microsoft.OpenApi.Models; // for the sswagger ui
using CremealServer.Models.Services;
using Microsoft.Extensions.FileProviders;
using CremealServer.Models;
using CremealServer.Models.ConfigureOptions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Swashbuckle.AspNetCore.Filters;
using Microsoft.Net.Http.Headers;
using System.Reflection;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

// Configure Stripe settings
var stripeSection = builder.Configuration.GetSection("Stripe");
StripeConfiguration.ApiKey = stripeSection["SecretKey"];

builder.Services.AddCors(p=> p.AddPolicy("corspolicy", build =>
{
    // need to change this for not allwoing others using the api in there domains
    build.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
}));

//add the email service 
builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

builder.Services.Configure<AuthenticationConfiguration>(builder.Configuration.GetSection("Authentication"));
builder.Services.AddScoped<AdminConfiguration>();

builder.Services.Configure<AdminConfiguration>(builder.Configuration.GetSection("AdminCredentials"));
builder.Services.AddScoped<AccessTokenGenerator>();

builder.Services.AddSingleton<AuthenticationConfiguration>(builder.Configuration.GetSection("Authentication").Get<AuthenticationConfiguration>());

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetSection("Authentication:AccessTokenSecret").Value)),
        ValidIssuer = builder.Configuration.GetSection("Authentication:Issuer").Value,
        ValidAudience = builder.Configuration.GetSection("Authentication:Audience").Value,
        ValidateIssuer = true,
        ValidateAudience = true,
        ClockSkew = TimeSpan.Zero
    };
});


builder.Services.AddSingleton<IModelPredictor, ModelPredictor>(serviceProvider =>
{
    // You can also use IOptions pattern to get the model path from configuration
    string modelPath = builder.Configuration.GetValue<string>("ModelPath") ?? "path_to_your_model.onnx";
    return new ModelPredictor(modelPath);
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Add services to the container.
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v3",
        Title = "Cremeal App API final project",
        Description = "An ASP.NET Core Web API for managing Cremeal App",
    });
   

    options.AddSecurityDefinition("bearerAuth", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = HeaderNames.Authorization,
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT", 
    });


    options.OperationFilter<SecurityRequirementsOperationFilter>();

});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (true)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// enalble static file to see the files and make it just for images
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "Images")),
    RequestPath = "/Images"
});


app.UseCors("corspolicy");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
