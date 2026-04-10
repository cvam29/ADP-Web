# Association of Dietetics Professionals Client

Frontend for the Association of Dietetics Professionals platform.

This application is built with Next.js App Router and talks to the sibling .NET 8 API project in `../DieticianAssociation.API`. The client is configured for static export and is intended to be deployed as a static site, while authenticated and dynamic data comes from the API.

## What This App Includes

- Public marketing pages for about, membership, events, education, resources, blog, contact, terms, privacy, and accessibility
- Auth flows for login, registration, reset password, and protected member areas
- Member dashboard sections for profile, certificates, directory, testimonials, tools, and notifications
- Admin screens for users, memberships, events, resources, blog, education, media, emails, and testimonials
- Certificate verification and member certificate download views
- Orval-generated TypeScript API client based on the backend OpenAPI document

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Zustand for client state
- Axios for API requests
- Orval for API client generation
- Lucide React icons

## Repository Layout

This README lives in the client project, but the application depends on both folders below:

```text
src/
├── DieticianAssociation.Client/
│   ├── app/                  # App Router routes and layouts
│   ├── components/           # Shared UI and feature components
│   ├── contexts/             # Auth and app-wide providers
│   ├── hooks/                # Client hooks and toast helpers
│   ├── lib/                  # Utilities and helpers
│   ├── services/             # Axios client and Orval-generated API bindings
│   ├── store/                # Zustand stores
│   ├── public/               # Static assets, robots.txt, llms.txt
│   └── openapi.json          # Generated from the API in development
└── DieticianAssociation.API/
	├── Controllers/          # REST endpoints
	├── Data/                 # EF Core context and seeders
	├── DTOs/                 # Request/response contracts
	├── Models/               # Domain models
	├── Services/             # Business logic
	└── Program.cs            # App startup and OpenAPI export
```

## Local Development

### Prerequisites

- Node.js 24.x
- npm
- .NET 8 SDK
- PostgreSQL accessible to the API

### 1. Start the API

From `src/DieticianAssociation.API`:

```bash
dotnet restore
dotnet run
```

Development launch settings expose the API on:

- `http://localhost:5258`
- `https://localhost:7088`

Useful API endpoints in development:

- Swagger UI: `https://localhost:7088/swagger`
- Health check: `https://localhost:7088/health`

When the API starts in development, it exports the current OpenAPI document to:

- `src/DieticianAssociation.Client/openapi.json`

### 2. Configure the client

Create a local env file in `src/DieticianAssociation.Client`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5258
```

If `NEXT_PUBLIC_API_URL` is not set, the client falls back to the production API gateway URL configured in `services/api-client.ts`.

### 3. Start the client

From `src/DieticianAssociation.Client`:

```bash
npm install
npm run dev
```

### 4. Build the client

```bash
npm run build
```

The client uses `output: "export"` in Next.js config, so production builds emit a static site in `out/`.

## Available Client Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run generate:api
npm run generate:api:watch
```

Notes:

- `generate:api` regenerates `services/generated.ts` from `openapi.json`
- `generate:api:watch` is useful while changing backend endpoints locally
- `start` exists, but the deployment model for this app is static export rather than a long-running Next server

## API Client Generation Workflow

The frontend API layer is generated with Orval using `orval.config.ts`.

Source of truth:

- Backend controllers and DTOs in `../DieticianAssociation.API`
- Generated OpenAPI file at `openapi.json`
- Generated client at `services/generated.ts`
- Shared Axios mutator at `services/api-client.ts`

Recommended flow after backend contract changes:

1. Start the API so it exports a fresh `openapi.json`
2. Run `npm run generate:api`
3. Update frontend code against the regenerated types and client methods

## Key Application Areas

Public routes:

- `/`
- `/about`
- `/membership`
- `/events`
- `/education`
- `/resources`
- `/blog`
- `/contact`
- `/verify-certificate`

Protected/member routes:

- `/profile`
- `/certificates`
- `/notifications`
- `/dashboard/*`

Admin routes:

- `/admin/users`
- `/admin/membership`
- `/admin/events`
- `/admin/resources`
- `/admin/education`
- `/admin/blog`
- `/admin/media`
- `/admin/testimonials`
- `/admin/emails/*`

## Deployment Notes

- The frontend is configured for static export in `next.config.mjs`
- Images are `unoptimized` to support static hosting
- `trailingSlash: true` is enabled
- `vercel.json` uses `npm run build`
- `public/robots.txt` currently disables indexing
- `public/llms.txt` is included for LLM discovery and site context

This setup is compatible with static hosting targets such as Azure Static Web Apps.

## Backend Integration Summary

The sibling API project uses:

- ASP.NET Core 8
- Entity Framework Core with PostgreSQL
- JWT authentication
- Swagger / OpenAPI
- Azure Blob Storage integration
- MailKit for email workflows
- Twilio package for messaging support
- Health checks and custom middleware

The API also applies pending EF Core migrations at startup and seeds core data such as permissions and geo data.

## Configuration Notes

Client configuration is primarily driven by:

- `NEXT_PUBLIC_API_URL`

Backend configuration is primarily driven by `appsettings*.json` plus environment-specific overrides for:

- database connection string
- JWT settings
- app base URLs
- email settings
- payment settings
- blob storage settings

Do not commit real secrets or production credentials to documentation or sample env files.

## Common Tasks

Regenerate API types:

```bash
npm run generate:api
```

Run the API with migrations applied automatically:

```bash
cd ../DieticianAssociation.API
dotnet run
```

Build the static frontend output:

```bash
npm run build
```

## Known Implementation Details

- ESLint and TypeScript build checks are currently ignored during Next production builds in `next.config.mjs`
- Auth tokens are stored client-side and injected by the Axios request interceptor
- A `401` response clears local auth state and redirects the user to login
- Certificate data in profile settings is fetched on demand only when the certificates tab is opened
