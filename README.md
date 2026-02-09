<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1COdxTW38pN8C6B1ELfuz3p4g2RwHVld8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Set the `VITE_GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Set Supabase keys in `.env.local` (for real database + auth):
   `VITE_SUPABASE_URL=...`
   `VITE_SUPABASE_ANON_KEY=...`
   (Optional) set admin email:
   `VITE_ADMIN_EMAIL=admin@gigconnect.com`
4. Start the Paystack server (for real payments):
   `cd server`
   `npm install`
   `npm run dev`
5. Run the app:
   `npm run dev`

## Preview Before Hosting

1. Build the app:
   `npm run build`
2. Preview the production build locally:
   `npm run preview`

## Note on Live Server

This project is built with Vite and TypeScript. The VS Code Live Server extension will not compile `.tsx` files, so it will throw console errors. Use `npm run dev` or `npm run preview` instead.

## Free Hosting (Vercel)

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_ANON_KEY`
   `VITE_ADMIN_EMAIL`
   `VITE_API_URL` (only if Paystack server is deployed)

## Custom Domain

1. Buy a domain (Namecheap/GoDaddy/etc).
2. In Vercel → Project → Domains → add your domain.
3. Copy the DNS records Vercel shows and paste them in your domain provider.
4. Update `public/robots.txt` and `public/sitemap.xml` to your real domain.

## PWA (Installable App)

This project is already configured as a PWA:
- `public/manifest.webmanifest`
- `public/sw.js`
- `public/offline.html`

After deployment, users can install it from the browser (Chrome → “Install App”).

## Play Store (Android)

Fastest path: wrap the PWA with Capacitor.

1. Install Capacitor:
   `npm install @capacitor/core @capacitor/cli`
2. Initialize:
   `npx cap init GigConnect com.gigconnect.app --web-dir=dist`
3. Build the web app:
   `npm run build`
4. Add Android:
   `npx cap add android`
5. Open Android Studio:
   `npx cap open android`
6. Build and upload the APK/AAB to Google Play Console.

Note: Use your production URL in Capacitor config when ready.

## Auto SEO + Blog

- SEO meta tags are updated automatically by view (dashboard, blog, post, etc.).
- Blog auto-publishing is enabled in **Admin → Automation Center**.
- The auto-blog creates Work News posts on a schedule and can be triggered manually in **Admin → Blog**.

## Safety + Verification

- Job posts require source verification details (company name + website/email/phone).
- Jobs are visible immediately but labeled **Verification Pending** until reviewed.
- Safety guidelines are available in the **Safety** page.
- Jobs support **Remote / On-site / Hybrid** and optional **country** for worldwide matching.

## Referral Program

- Each user has a referral link: `/?ref=<user-id>`
- When a referred user applies for a job, the referrer earns a bonus (see `REFERRAL_BONUS` in `constants.ts`).
- Referral rewards are added to the wallet automatically.

## Tailwind CSS

Tailwind is installed via PostCSS. Do not use the CDN script in production.

## Paystack Setup

1. Create a Paystack account and get your **Secret Key**.
2. Create `server/.env` with:
   `PAYSTACK_SECRET_KEY=your_secret_key`
   `SUPABASE_URL=https://your-project.supabase.co`
   `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`
   `PLATFORM_FEE_RATE=0.1`
3. The frontend calls the server at `VITE_API_URL` (default `http://localhost:4242`).
4. Never expose the **service role key** in frontend code.

## Supabase Setup (Full Tables + RLS)

1. Create a Supabase project.
2. In **Authentication > Providers**, enable **Email**.
3. For quick launch, disable email confirmation (Auth > Settings).
4. In SQL editor, run `supabase/schema.sql`.
5. Add keys to `.env.local`:
   `VITE_SUPABASE_URL=your_project_url`
   `VITE_SUPABASE_ANON_KEY=your_anon_key`
6. Set `VITE_ADMIN_EMAIL` to the email you will use for the admin account.

The app will sync all data to Supabase automatically (no code changes needed). Users will be authenticated by Supabase, and profile data is synced via the Supabase tables.

If you already ran the schema before, re-run it to add the new columns/tables (blog + referrals + job verification + country).

## Demo Seed Data

Seed data is **disabled by default**. To enable demo data locally, set:
`VITE_SEED_LOCAL=true`

### Important Notes
- Some policies are intentionally permissive to allow frontend-only operations (notifications and wallet entries). Tighten these once you move financial logic to a backend/edge function.
