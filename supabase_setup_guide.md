# Setting up Supabase for Zuri MVP

This guide walks you through connecting a real Supabase backend to Zuri — including auth, database tables, and file storage.

---

## Step 1: Create a Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project**.
2. Sign in with your **GitHub account**.
3. Click **New Project**.
4. Fill in:
   - **Organization**: Select your org (or create one).
   - **Project Name**: `zuri`
   - **Database Password**: Choose a strong password (save it somewhere!).
   - **Region**: `South Asia (Mumbai)` — select the closest to your users.
5. Click **Create new project**. Wait ~2 minutes for it to spin up.

---

## Step 2: Get Your API Keys

1. Once your project is ready, go to **Project Settings** → **API** (in the left sidebar).
2. You will see two values:
   - **Project URL** — e.g., `https://xyzcompany.supabase.co`
   - **anon/public key** — a long `eyJ...` string
3. Copy both. You'll paste them into your `.env.local` file next.

---

## Step 3: Configure Environment Variables

Open the file [.env.local](file:///c:/Users/MOHD%20ABBAS/OneDrive/Desktop/Project/Zuri/zuri-app/.env.local) in your project and replace the placeholder values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xyzcompany.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJI..."
```

> [!IMPORTANT]
> The Zuri codebase is already configured to read these variables in [supabase.ts](file:///c:/Users/MOHD%20ABBAS/OneDrive/Desktop/Project/Zuri/zuri-app/src/lib/supabase.ts). You do not need to edit any code!

---

## Step 4: Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers** (in the left sidebar).
2. **Email** is enabled by default. Verify that it says "Enabled".
3. *(Optional)* Toggle off **Confirm email** under Authentication → Settings if you want instant signups during development (no email verification needed).

---

## Step 5: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar).
2. Click **New query**.
3. Paste the following SQL and click **Run**:

```sql
-- ============================================
-- ZURI DATABASE SCHEMA
-- ============================================

-- 1. Users (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'owner')) DEFAULT 'customer',
  hair_skin_profile JSONB DEFAULT '{}',
  ai_diagnostic_results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Salons
CREATE TABLE public.salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  style_tags TEXT[] DEFAULT '{}',
  address TEXT,
  contact_info JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  about TEXT,
  operating_hours JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Services (linked to salons)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration TEXT
);

-- 4. Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  images TEXT[] DEFAULT '{}',
  text TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, users can update their own
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Salons: anyone can read, owners can manage their own
CREATE POLICY "Salons are viewable by everyone" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Owners can manage own salons" ON public.salons FOR ALL USING (auth.uid() = owner_id);

-- Services: anyone can read, salon owners can manage
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Owners can manage services" ON public.services FOR ALL
  USING (EXISTS (SELECT 1 FROM public.salons WHERE salons.id = services.salon_id AND salons.owner_id = auth.uid()));

-- Bookings: users see own, salon owners see their salon's
CREATE POLICY "Users can see own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can see salon bookings" ON public.bookings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.salons WHERE salons.id = bookings.salon_id AND salons.owner_id = auth.uid()));
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: anyone can read, users can create own
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
```

> [!TIP]
> You can verify the tables were created by going to **Table Editor** in the left sidebar. You should see 5 tables: `users`, `salons`, `services`, `bookings`, `reviews`.

---

## Step 6: Setup Supabase Storage (for Images)

1. Go to **Storage** (left sidebar) in the Supabase dashboard.
2. Click **New bucket**.
3. Create two buckets:
   - **Name**: `salon-images` — Toggle **Public bucket** ON.
   - **Name**: `diagnostic-selfies` — Leave as private.
4. Click **Create bucket** for each.

---

## Step 7: Restart the Dev Server

After updating `.env.local` with your real keys:

```powershell
cd "C:\Users\MOHD ABBAS\OneDrive\Desktop\Project\Zuri\zuri-app"
npm run dev
```

> [!NOTE]
> You **must** restart the server after changing `.env.local` for the new variables to take effect.

---

## Quick Reference

| What | Where in Supabase Dashboard |
|---|---|
| API Keys | Project Settings → API |
| Auth Config | Authentication → Providers |
| Tables | Table Editor |
| SQL Runner | SQL Editor |
| File Storage | Storage |
| Logs | Logs (left sidebar) |
