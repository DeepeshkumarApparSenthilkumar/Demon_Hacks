# Chicago Housing Intelligence Platform

An advanced, AI-powered real estate intelligence platform built for the Chicago market.

## Architecture

*   **Framework**: Next.js 14 App Router
*   **Database**: PostgreSQL with PostGIS extension (hosted on Supabase or Railway)
*   **ORM**: Prisma
*   **Authentication**: Clerk
*   **UI/Styling**: Tailwind CSS + ShadCN UI + Framer Motion
*   **Mapping**: Mapbox GL JS + React-Map-GL
*   **AI Services**: Vercel AI SDK 3.0 + OpenAI (gpt-4o)

## Setup Instructions

1.  **Environment Variables**:
    *   Copy `.env.example` to `.env.local`
    *   Fill in keys for:
        *   `DATABASE_URL` (Requires a Postgres database with PostGIS enabled)
        *   Clerk Auth Keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
        *   `OPENAI_API_KEY`
        *   `NEXT_PUBLIC_MAPBOX_TOKEN`

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Database Initialization**:
    Ensure your Postgres URL points to a database with the `postgis` extension enabled.
    ```sql
    -- If setting up DB manually, run:
    CREATE EXTENSION postgis;
    ```
    Push the schema:
    ```bash
    npx prisma db push
    ```

4.  **Seed the Database**:
    This will generate realistic Chicago mock data with PostGIS points.
    ```bash
    npm run prisma seed
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Cloud Deployment (Vercel)

1.  Create a project on Vercel and link your GitHub repository.
2.  Add all environment variables from `.env.local` to the Vercel project settings.
3.  Add the `DATABASE_URL` as well (point it to your production Supabase database).
4.  Override the Build Command in Vercel to:
    ```bash
    npx prisma generate && npx prisma db push && next build
    ```
5.  Deploy.

### Scalability Notes
- PostGIS queries (`ST_DWithin`) are handled on the DB layer for performance.
- AI route handlers use streaming (`ai/react` `useChat`) to avoid Vercel Serverless Function timeout limits.
- Prisma client uses a singleton in dev to avoid connection exhaustion, but consider Prisma Accelerate for heavy production workloads.
