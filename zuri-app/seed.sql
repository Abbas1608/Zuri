-- ============================================================
-- ZURI SEED DATA
-- Run this in Supabase SQL Editor AFTER creating your schema.
-- This inserts 4 demo salons with services so the app has data.
-- ============================================================

-- IMPORTANT: First create a test OWNER user via the signup page
-- with role = 'owner', then replace the UUID below with their user ID.
-- You can find the UUID in Supabase → Authentication → Users

-- Step 1: Get your owner user ID:
-- SELECT id FROM public.users WHERE role = 'owner' LIMIT 1;

-- Step 2: Replace 'YOUR_OWNER_USER_ID' below with the actual UUID and run:

DO $$
DECLARE
  owner_id UUID;
  salon1_id UUID;
  salon2_id UUID;
  salon3_id UUID;
  salon4_id UUID;
BEGIN
  -- Get the first owner user (change this if needed)
  SELECT id INTO owner_id FROM public.users WHERE role = 'owner' LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE NOTICE 'No owner user found. Please sign up as an owner first, then run this seed.';
    RETURN;
  END IF;

  RAISE NOTICE 'Using owner ID: %', owner_id;

  -- ─── Salon 1: Silk & Stone Studio ────────────────────────────
  INSERT INTO public.salons (owner_id, name, address, about, style_tags, rating, operating_hours, images)
  VALUES (
    owner_id,
    'Silk & Stone Studio',
    '12, Linking Road, Bandra West, Mumbai 400050',
    'Award-winning colourists and bridal specialists set in a luxurious Bandra studio. Known for our signature balayage technique and relaxed, welcoming atmosphere.',
    ARRAY['Balayage', 'Bridal', 'Keratin'],
    4.9,
    '{"mon_fri": "10:00–20:00", "saturday": "10:00–20:00", "sunday": "11:00–18:00"}',
    ARRAY[
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=600'
    ]
  ) RETURNING id INTO salon1_id;

  INSERT INTO public.services (salon_id, name, price, duration) VALUES
    (salon1_id, 'Signature Balayage',       3500, '3h'),
    (salon1_id, 'Bridal Makeup',            6000, '4h'),
    (salon1_id, 'Keratin Treatment',        2800, '2.5h'),
    (salon1_id, 'Cut & Blowdry',             800, '1h'),
    (salon1_id, 'Deep Conditioning Spa',    1200, '1.5h');

  -- ─── Salon 2: The Monsoon Mane ───────────────────────────────
  INSERT INTO public.salons (owner_id, name, address, about, style_tags, rating, operating_hours, images)
  VALUES (
    owner_id,
    'The Monsoon Mane',
    '34, Juhu Tara Road, Juhu, Mumbai 400049',
    'Humidity specialists. Your hair survives every Mumbai monsoon with our anti-frizz treatments and keratin bonding techniques.',
    ARRAY['Keratin', 'Anti-Frizz', 'Nails'],
    4.7,
    '{"mon_fri": "10:00–21:00", "saturday": "09:00–21:00", "sunday": "10:00–19:00"}',
    ARRAY[
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=600'
    ]
  ) RETURNING id INTO salon2_id;

  INSERT INTO public.services (salon_id, name, price, duration) VALUES
    (salon2_id, 'Brazilian Keratin',        2800, '2.5h'),
    (salon2_id, 'Anti-Frizz Serum Spa',    1400, '1h'),
    (salon2_id, 'Gel Nail Art',              900, '1.5h'),
    (salon2_id, 'Cut & Style',               700, '45m');

  -- ─── Salon 3: Heritage Glow ──────────────────────────────────
  INSERT INTO public.salons (owner_id, name, address, about, style_tags, rating, operating_hours, images)
  VALUES (
    owner_id,
    'Heritage Glow',
    '78, Colaba Causeway, Colaba, Mumbai 400005',
    'Old-world luxury meets modern beauty science in the heart of South Mumbai. Specialising in HD makeup, advanced skin treatments, and bridal packages.',
    ARRAY['HD Makeup', 'Skin', 'Bridal'],
    4.8,
    '{"mon_fri": "10:00–20:00", "saturday": "10:00–20:00", "sunday": "Closed"}',
    ARRAY[
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=600',
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600'
    ]
  ) RETURNING id INTO salon3_id;

  INSERT INTO public.services (salon_id, name, price, duration) VALUES
    (salon3_id, 'HD Bridal Makeup',         6000, '4h'),
    (salon3_id, 'Skin Brightening Facial',  2200, '1.5h'),
    (salon3_id, 'Gold Facial',              1800, '1h'),
    (salon3_id, 'Eyebrow Threading & Shaping', 350, '30m');

  -- ─── Salon 4: Aria Beauty Lounge ─────────────────────────────
  INSERT INTO public.salons (owner_id, name, address, about, style_tags, rating, operating_hours, images)
  VALUES (
    owner_id,
    'Aria Beauty Lounge',
    '56, Andheri West, Andheri, Mumbai 400058',
    'Neighbourhood luxury — express services, walk-ins welcome. From nail art to waxing, we do it all with zero compromise on quality.',
    ARRAY['Nails', 'Waxing', 'Anti-Frizz'],
    4.6,
    '{"mon_fri": "09:00–21:00", "saturday": "09:00–21:00", "sunday": "10:00–20:00"}',
    ARRAY[
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=600',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600'
    ]
  ) RETURNING id INTO salon4_id;

  INSERT INTO public.services (salon_id, name, price, duration) VALUES
    (salon4_id, 'Full Body Waxing',          800, '1h'),
    (salon4_id, 'Nail Art (Gel)',            700, '1h'),
    (salon4_id, 'Eyelash Extensions',       1200, '1.5h'),
    (salon4_id, 'Cut & Blowdry',             500, '45m');

  RAISE NOTICE 'Seed complete! Created 4 salons with services.';
END $$;
