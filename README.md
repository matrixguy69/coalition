# Coalition Tiers

A Minecraft PvP tier list / leaderboard site. Static HTML/CSS/JS —
no build step, no server — backed by Supabase for shared data and login.

- **Anyone** who visits can view the leaderboard, tier boards, and player skins.
- **Only you** (the admin account you create) can add, edit, or remove players.
  This is enforced by the database itself (Row Level Security), not just
  hidden buttons — so it can't be bypassed from the browser console.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up / log in → **New project**.
2. Pick any name/region, set a database password (save it somewhere), wait ~1 minute for it to provision.

## 2. Create the database table

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase-schema.sql` from this folder, paste its full contents in, click **Run**.
3. You should see a `players` table appear under **Table Editor**. That's it — schema done.

## 3. Create your admin login

This is the account that will be allowed to add/edit/remove players.

1. In Supabase: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter an email and password you'll remember. Check **Auto Confirm User** if that
   checkbox is shown (skips email verification — fine for a one-person admin account).
3. **Turn off public sign-ups** so nobody else can create their own account:
   **Authentication** → **Providers** (or **Sign In / Providers** depending on your
   Supabase version) → **Email** → turn off **"Allow new users to sign up"**.
   (Exact wording/location shifts between Supabase versions — look for an
   "enable signups" toggle under the Email provider settings.)

You now have exactly one account that can log in, and it's yours.

## 4. Connect the site to your project

1. In Supabase: **Settings** → **API**.
2. Copy the **Project URL** and the **anon public** key (NOT `service_role` — never expose that one).
3. Open `config.js` in this folder and paste them in:
   ```js
   const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOi....';
   ```
   The anon key is meant to be public/client-side — it's safe because the RLS
   policies from step 2 control what it's actually allowed to do.
4. Optional: also in `config.js`, set `DISCORD_INVITE_URL` to your server's invite
   link if you want the Discord header button to work.

## 5. Test it locally (optional but recommended)

Browsers block some things when you just double-click an `index.html` file, so serve it locally:

```bash
# from inside the coalition-tiers-site folder
npx serve .
# or: python3 -m http.server 8080
```

Open the printed local URL. Click **Admin Login** top-right, sign in with the
account from step 3, and you should see an **+ Add Player** button appear.

## 6. Push to GitHub

```bash
cd coalition-tiers-site
git init
git add .
git commit -m "Coalition Tiers"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/coalition-tiers.git
git push -u origin main
```

(Create the empty repo on GitHub first if you haven't.)

**Heads up:** `config.js` contains your Supabase URL and anon key, and this
repo will include it. That's fine for the *anon* key (see step 4), but if
you want to keep the repo private anyway, make it a private GitHub repo —
Vercel can still deploy private repos.

## 7. Deploy on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import your GitHub repo.
2. Framework Preset: **Other**. Build Command: leave blank. Output Directory: leave blank/`.`
   (it's a static site, nothing to build).
3. **Deploy**. You'll get a live URL like `coalition-tiers.vercel.app`.

Every future `git push` to `main` auto-redeploys.

---

## Using the site

- **View**: open the site, browse the **Overall** tab (ranked, with titles) or any
  gamemode tab. Each gamemode tab has a **Ranked / Tier Board** toggle — Ranked is a
  sorted table, Tier Board is the column-per-tier view. Click any player to open
  their **profile card** — skin, title, region (if set), a NameMC link, their rank
  in every tab they're ranked in, and their full tier chip row.
- **Info panel**: the **Info** button in the header shows the S–F tier grade mapping,
  the HT3 requirement note, per-gamemode FT testing requirements, and the point
  thresholds for each title — all pulled straight from `data.js`.
- **Discord button**: opens `DISCORD_INVITE_URL` from `config.js` in a new tab.
- **Log in**: click **Admin Login** top-right, enter the email/password from step 3.
- **Add a player**: once logged in, click **+ Add Player**, type their exact Minecraft
  username (also used to fetch their skin), optionally set a region, set a tier per
  gamemode (leave "Untested" for modes they haven't been ranked in), **Save player**.
- **Edit / remove**: hover a row (or the Tier Board) — edit/trash icons appear for admins.
  You can also open a player's profile card and click **Edit player** at the bottom.
- **Reorder within a tier**: in Tier Board view, use the up/down arrows next to a
  name to move them within that tier column (cosmetic ordering only — doesn't
  change points, since points come from the tier itself).
- **Log out**: click the same button (now labeled "Admin (log out)").

## Customizing

Open `data.js` — no other file needs to change:

- **Points per tier / add or remove tiers** → edit the `TIERS` array (`grade` is the
  S/A/B/C/D/F label shown in the Info panel).
- **Gamemodes** → edit the `GAMEMODES` array (`key` must be a short lowercase
  slug with no spaces; `label` is what's shown). Adding a new gamemode here
  automatically adds its tab, its column in Add/Edit Player, and a slot in the
  Info panel's FT table (add a matching entry to `TESTING_INFO.ftRequirements`
  or it just won't show a row there).
- **Titles shown on the Overall tab** → edit `TITLES` (thresholds are total
  points across all gamemodes; max right now is 30 × 10 = 300).
- **Tier system grades / HT3 rule / FT requirements** → edit `TESTING_INFO`.

To add a matching icon for a brand-new gamemode key, add an entry to the `ICONS`
object near the top of `app.js` (any inline SVG path data, using `currentColor`).

Colors, fonts, and layout live in `style.css` if you want to restyle further.

## Troubleshooting

- **Yellow "Setup needed" banner** → `config.js` still has placeholder values.
- **"Couldn't load the leaderboard"** → double check `supabase-schema.sql` was run
  and the URL/key in `config.js` are correct (Project URL, not the dashboard URL).
- **Login fails** → confirm the user exists under Authentication → Users, and that
  "Auto Confirm User" was checked (unconfirmed emails can't log in).
- **Can log in but Add Player still doesn't save** → re-check the RLS policies from
  `supabase-schema.sql` ran successfully (Table Editor → players → RLS should show
  4 policies).
