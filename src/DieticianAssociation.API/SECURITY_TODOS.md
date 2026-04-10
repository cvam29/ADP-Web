# Security Audit — Action Items

> Audited: 2026-03-16  
> Scope: DieticianAssociation.API

Items marked ✅ have already been implemented in the same pass as this audit.

---

## 🔴 CRITICAL

- [ ] **[CRIT-1] Plaintext credentials in `appsettings.json`**  
  **Affected:** `appsettings.json` — `ConnectionStrings.DefaultConnection`, `JwtSettings.SecretKey`, `Email.Smtp.Password`, `Email.Imap.Accounts[*].Password`  
  **Issue:** Database connection string (including password), SMTP password, IMAP account password, and JWT signing key are stored as plaintext in a source-controlled file.  
  **Fix:** Move all secrets to environment variables or Azure Key Vault. In development use `dotnet user-secrets`. Replace the literal values in `appsettings.json` with empty strings and read them via `Environment.GetEnvironmentVariable(...)` or `IConfiguration` backed by environment variables. Ensure sensitive `appsettings.*.json` files are listed in `.gitignore`.

- [ ] **[CRIT-2] No rate limiting on authentication endpoints**  
  **Affected:** `Controllers/AuthController.cs` — `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/forgot-password`  
  **Issue:** No rate limiting exists anywhere in the middleware pipeline, leaving login and password-reset endpoints vulnerable to credential stuffing and brute-force attacks.  
  **Fix:** Add the built-in `Microsoft.AspNetCore.RateLimiting` middleware (available in .NET 7+). Apply a fixed-window or sliding-window policy (e.g. 5 requests/minute per IP) to auth endpoints. Register with `builder.Services.AddRateLimiter(...)` and call `app.UseRateLimiter()` before `UseAuthentication` in `Program.cs`.

---

## 🟠 HIGH

- [x] **[HIGH-1] Missing HTTP security response headers** ✅ Implemented  
  **Affected:** `Extensions/ServiceExtensions.cs` — `UseSecurityHeaders()`  
  **Headers added:** `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Content-Security-Policy`, `Permissions-Policy`, `X-XSS-Protection`. `Server` header suppressed.

- [x] **[HIGH-2] Swagger UI accessible in production** ✅ Implemented  
  **Affected:** `Extensions/ServiceExtensions.cs` — `UseSwaggerDocumentation()`  
  **Fix applied:** Wrapped `UseSwagger()` / `UseSwaggerUI()` in an `IsDevelopment()` guard.

- [x] **[HIGH-3] `AllowedHosts: "*"` — host header injection not mitigated** ✅ Implemented  
  **Affected:** `appsettings.json`  
  **Fix applied:** Restricted to `adp.org.in;www.adp.org.in;localhost`.

---

## 🟡 MEDIUM

- [ ] **[MED-1] JWT token lifetime is 24 hours with no refresh token support**  
  **Affected:** `appsettings.json` — `JwtSettings:ExpirationMinutes: 1440`; `Services/JwtService.cs`  
  **Issue:** A stolen token is valid for a full 24 hours. No refresh-token endpoint exists to support short-lived access tokens.  
  **Fix:** Reduce `ExpirationMinutes` to 15–60 minutes. Implement a `POST /api/auth/refresh` endpoint that accepts a long-lived, securely stored refresh token and returns a new short-lived JWT.

- [ ] **[MED-2] `/health` endpoint is unauthenticated**  
  **Affected:** `Program.cs` — `app.MapHealthChecks("/health")`  
  **Issue:** The health check endpoint can expose internal application state (DB connectivity, service liveness) to anyone.  
  **Fix:** Restrict to internal calls or require an admin API key. Example: `app.MapHealthChecks("/health").RequireAuthorization()` or use `RequireHost` for internal IP ranges only.

- [x] **[MED-3] CORS `AllowFrontend` policy missing production origins** ✅ Implemented  
  **Affected:** `Extensions/ServiceExtensions.cs` — `AddCustomCors()`  
  **Fix applied:** Added `https://www.adp.org.in` and `https://adp.org.in` to the `AllowFrontend` policy's origin whitelist.

- [x] **[MED-4] `IsDevelopment: true` hardcoded in `appsettings.json`** ✅ Implemented  
  **Affected:** `appsettings.json`  
  **Fix applied:** Removed the custom `IsDevelopment` key; use `IWebHostEnvironment.IsDevelopment()` throughout.

---

## 🟢 LOW

- [x] **[LOW-1] Password minimum length is 6 characters — too weak** ✅ Implemented  
  **Affected:** `DTOs/AuthDTOs.cs` — `RegisterRequestDto.Password`, `ChangePasswordDto.NewPassword`  
  **Fix applied:** Increased `[MinLength]` to 12 on both password fields.

- [x] **[LOW-2] Phone number field has no validation** ✅ Implemented  
  **Affected:** `DTOs/AuthDTOs.cs` — `RegisterRequestDto.Phone`  
  **Fix applied:** Added `[RegularExpression]` attribute to accept only valid international phone numbers (7–15 digits, optional leading `+`).

- [ ] **[LOW-3] No account lockout after repeated failed login attempts**  
  **Affected:** `Services/AuthService.cs` — `LoginAsync()`  
  **Issue:** Unlimited failed login attempts are silently discarded. Combined with the absence of rate limiting ([CRIT-2]), this allows unbounded brute-force exploitation.  
  **Fix:** Track failed attempts per user in the database (or a distributed cache). Lock the account for a configurable period (e.g. 15 minutes) after 5 consecutive failures. Return `HTTP 429 Too Many Requests`, log the event, and send an alert email to the account owner.
