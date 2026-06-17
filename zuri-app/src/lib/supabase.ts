import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*
* Supabase Database Schema (PostgreSQL Tables)
*
* 1. `users` table:
*    - id: uuid (primary key, references auth.users)
*    - email: text
*    - role: text ('customer' | 'owner')
*    - name: text
*    - hair_skin_profile: jsonb (undertone, hair type, etc.)
*    - ai_diagnostic_results: jsonb (saved AI recommendations)
*    - created_at: timestamptz
*
* 2. `salons` table:
*    - id: uuid (primary key, default gen_random_uuid())
*    - owner_id: uuid (references users.id)
*    - name: text
*    - style_tags: text[]
*    - address: text
*    - contact_info: jsonb
*    - images: text[] (URLs from Supabase Storage)
*    - rating: numeric
*    - created_at: timestamptz
*
* 3. `services` table:
*    - id: uuid (primary key, default gen_random_uuid())
*    - salon_id: uuid (references salons.id)
*    - name: text
*    - price: numeric
*
* 4. `bookings` table:
*    - id: uuid (primary key, default gen_random_uuid())
*    - user_id: uuid (references users.id)
*    - salon_id: uuid (references salons.id)
*    - service_id: uuid (references services.id)
*    - date: date
*    - time: text
*    - status: text ('pending' | 'confirmed' | 'completed' | 'cancelled')
*    - created_at: timestamptz
*
* 5. `reviews` table:
*    - id: uuid (primary key, default gen_random_uuid())
*    - user_id: uuid (references users.id)
*    - salon_id: uuid (references salons.id)
*    - images: text[]
*    - text: text
*    - rating: integer
*    - created_at: timestamptz
*/
