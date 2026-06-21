-- Run this script in the Supabase SQL Editor to insert the MumbaiWorld salon and 20 reviews.
DO $$
DECLARE
  v_owner UUID;
  salon_id UUID;
  u1 UUID := gen_random_uuid();
  u2 UUID := gen_random_uuid();
  u3 UUID := gen_random_uuid();
  u4 UUID := gen_random_uuid();
  u5 UUID := gen_random_uuid();
  u6 UUID := gen_random_uuid();
  u7 UUID := gen_random_uuid();
  u8 UUID := gen_random_uuid();
  u9 UUID := gen_random_uuid();
  u10 UUID := gen_random_uuid();
  u11 UUID := gen_random_uuid();
  u12 UUID := gen_random_uuid();
  u13 UUID := gen_random_uuid();
  u14 UUID := gen_random_uuid();
  u15 UUID := gen_random_uuid();
  u16 UUID := gen_random_uuid();
  u17 UUID := gen_random_uuid();
  u18 UUID := gen_random_uuid();
  u19 UUID := gen_random_uuid();
  u20 UUID := gen_random_uuid();
BEGIN
  -- Get an owner to attach the salon to
  SELECT id INTO v_owner FROM public.users WHERE role = 'owner' LIMIT 1;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'No owner user found. Ensure an owner exists first.';
  END IF;

  -- Create MumbaiWorld Salon
  INSERT INTO public.salons (owner_id, name, address, about, style_tags, rating, operating_hours, images)
  VALUES (
    v_owner,
    'MumbaiWorld',
    '12 A seawood fegdhxbs fcrgvedhq',
    'A premier beauty destination offering world-class services.',
    ARRAY['Hair Styling', 'Spa', 'Bridal'],
    4.8,
    '{"mon_fri": "10:00-20:00", "saturday": "10:00-21:00", "sunday": "11:00-19:00"}',
    ARRAY[
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800',
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=800'
    ]
  ) RETURNING id INTO salon_id;

  -- Insert services for MumbaiWorld
  INSERT INTO public.services (salon_id, name, price, duration) VALUES
    (salon_id, 'Signature Haircut', 1200, '45m'),
    (salon_id, 'Deep Tissue Spa', 3500, '90m'),
    (salon_id, 'Gel Manicure', 800, '1h');

  -- Insert 20 completely unique dummy users with Indian names
  INSERT INTO public.users (id, name, role) VALUES 
    (u1, 'Ananya Sharma', 'customer'),
    (u2, 'Aarav Patel', 'customer'),
    (u3, 'Diya Singh', 'customer'),
    (u4, 'Vivaan Gupta', 'customer'),
    (u5, 'Aditi Desai', 'customer'),
    (u6, 'Aditya Kumar', 'customer'),
    (u7, 'Kavya Joshi', 'customer'),
    (u8, 'Vihaan Mehta', 'customer'),
    (u9, 'Riya Kapoor', 'customer'),
    (u10, 'Arjun Reddy', 'customer'),
    (u11, 'Neha Verma', 'customer'),
    (u12, 'Sai Menon', 'customer'),
    (u13, 'Pooja Iyer', 'customer'),
    (u14, 'Rayaan Nair', 'customer'),
    (u15, 'Sneha Rao', 'customer'),
    (u16, 'Krishna Das', 'customer'),
    (u17, 'Isha Bhatia', 'customer'),
    (u18, 'Ishaan Chatterjee', 'customer'),
    (u19, 'Priya Ahuja', 'customer'),
    (u20, 'Shaurya Pillai', 'customer');

  -- Insert 20 reviews for MumbaiWorld, each from a unique user
  INSERT INTO public.reviews (user_id, salon_id, rating, text, created_at) VALUES
    (u1, salon_id, 5, 'Absolutely loved my experience! The staff understood exactly what I wanted.', NOW() - INTERVAL '1 days'),
    (u2, salon_id, 4, 'Incredible service. Looked amazing for my event.', NOW() - INTERVAL '3 days'),
    (u3, salon_id, 5, 'This is my go-to place now. The vibe is immaculate.', NOW() - INTERVAL '5 days'),
    (u4, salon_id, 5, 'Worth every penny! My friends couldn''t stop complimenting me.', NOW() - INTERVAL '7 days'),
    (u5, salon_id, 5, 'Highly recommend! They used high-quality products.', NOW() - INTERVAL '9 days'),
    (u6, salon_id, 4, 'My hair feels like silk. They didn''t try to oversell me.', NOW() - INTERVAL '11 days'),
    (u7, salon_id, 4, 'Great results, but I had to wait about 20 minutes.', NOW() - INTERVAL '14 days'),
    (u8, salon_id, 5, 'Very nice place. The styling was spot on.', NOW() - INTERVAL '16 days'),
    (u9, salon_id, 5, 'Good service and nice ambience.', NOW() - INTERVAL '18 days'),
    (u10, salon_id, 4, 'Overall solid experience. Clean, professional.', NOW() - INTERVAL '21 days'),
    (u11, salon_id, 5, 'Stylist was very knowledgeable.', NOW() - INTERVAL '23 days'),
    (u12, salon_id, 5, 'Best salon in the area by far.', NOW() - INTERVAL '25 days'),
    (u13, salon_id, 4, 'Very happy with my highlights.', NOW() - INTERVAL '27 days'),
    (u14, salon_id, 5, 'I always leave this place feeling great.', NOW() - INTERVAL '29 days'),
    (u15, salon_id, 5, 'The staff is super friendly and welcoming.', NOW() - INTERVAL '32 days'),
    (u16, salon_id, 5, 'Got a beautiful haircut, will definitely return.', NOW() - INTERVAL '35 days'),
    (u17, salon_id, 4, 'The spa treatment was incredibly relaxing.', NOW() - INTERVAL '38 days'),
    (u18, salon_id, 5, 'Amazing attention to detail.', NOW() - INTERVAL '40 days'),
    (u19, salon_id, 5, 'They really know how to treat their customers well.', NOW() - INTERVAL '42 days'),
    (u20, salon_id, 5, '5 stars! Perfect in every way.', NOW() - INTERVAL '45 days');

  RAISE NOTICE 'MumbaiWorld salon and 20 reviews with 20 UNIQUE names created successfully!';
END $$;
