import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const INDIAN_NAMES = ['Ananya', 'Diya', 'Aditi', 'Kavya', 'Riya', 'Neha', 'Pooja', 'Sneha', 'Isha', 'Priya', 'Kiara', 'Aisha', 'Mira', 'Tara', 'Sana'];
const REVIEWS = [
  "Absolutely loved my experience! The staff understood exactly what I wanted.",
  "Incredible service. Looked amazing for my event.",
  "This is my go-to place now. The vibe is immaculate.",
  "Worth every penny! My friends couldn't stop complimenting me.",
  "Highly recommend! They used high-quality products.",
  "My hair feels like silk. They didn't try to oversell me.",
  "Great results, but I had to wait about 20 minutes.",
  "Very nice place. The styling was spot on.",
  "Good service and nice ambience.",
  "Overall solid experience. Clean, professional.",
  "Stylist was very knowledgeable.",
  "Best salon in the area by far.",
  "Very happy with my highlights.",
  "I always leave this place feeling great.",
  "The staff is super friendly and welcoming.",
  "Got a beautiful haircut, will definitely return.",
  "The spa treatment was incredibly relaxing.",
  "Amazing attention to detail.",
  "They really know how to treat their customers well.",
  "5 stars! Perfect in every way."
];

async function run() {
  try {
    // 1. Get an owner user
    const { data: users, error: userError } = await supabase.from('users').select('id').eq('role', 'owner').limit(1);
    if (userError || !users || users.length === 0) {
      console.error('Failed to get owner user:', userError);
      return;
    }
    const ownerId = users[0].id;
    console.log('Using owner ID:', ownerId);

    // 2. Create the salon
    const { data: salon, error: salonError } = await supabase.from('salons').insert({
      owner_id: ownerId,
      name: 'MumbaiWorld',
      address: '12 A seawood fegdhxbs fcrgvedhq',
      about: 'A premier beauty destination offering world-class services.',
      style_tags: ['Hair Styling', 'Spa', 'Bridal'],
      rating: 4.8,
      operating_hours: { mon_fri: '10:00-20:00', saturday: '10:00-21:00', sunday: '11:00-19:00' },
      images: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800'
      ]
    }).select().single();

    if (salonError) {
      console.error('Failed to create salon:', salonError);
      return;
    }
    console.log('Created salon:', salon.id);

    // 3. Create services
    await supabase.from('services').insert([
      { salon_id: salon.id, name: 'Premium Haircut', price: 1500, duration: '60m' },
      { salon_id: salon.id, name: 'Luxury Spa', price: 3000, duration: '90m' }
    ]);

    // 4. Create dummy users and reviews
    // Since we need random Indian names, we'll just insert directly into public.users
    // assuming there's no strict foreign key on auth.users for this test app, or we can use the 'aaya' trick.
    // The codebase has `r.users?.name === 'aaya' ? INDIAN_NAMES[...] : ...`
    // Let's create one user named 'aaya' and attach all reviews to it.
    let aayaId;
    const { data: aayaUser } = await supabase.from('users').select('id').eq('name', 'aaya').limit(1);
    if (aayaUser && aayaUser.length > 0) {
      aayaId = aayaUser[0].id;
    } else {
      // Just use the ownerId and rename them to 'aaya', wait no, that renames the owner!
      // Let's see if we can insert a user with a random UUID
      const { data: newUser, error: newUserError } = await supabase.from('users').insert({
        id: crypto.randomUUID(),
        name: 'aaya',
        role: 'customer'
      }).select().single();
      
      if (newUserError) {
        console.error('Failed to create aaya user:', newUserError);
        // Fallback to owner ID
        aayaId = ownerId;
      } else {
        aayaId = newUser.id;
      }
    }

    const reviewsToInsert = [];
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      
      reviewsToInsert.push({
        user_id: aayaId,
        salon_id: salon.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
        text: REVIEWS[i],
        created_at: d.toISOString()
      });
    }

    const { error: reviewsError } = await supabase.from('reviews').insert(reviewsToInsert);
    if (reviewsError) {
      console.error('Failed to insert reviews:', reviewsError);
      return;
    }
    
    console.log('Successfully inserted 20 reviews for MumbaiWorld!');
  } catch (e) {
    console.error(e);
  }
}

run();
