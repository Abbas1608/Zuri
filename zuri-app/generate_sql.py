import random

salons = [
  # BALAYAGE
  {"id": "s1", "uuid": "a1000001-0000-0000-0000-000000000001", "name": "Gloss Studio Bandra", "tags": ["balayage","caramel balayage","highlights"], "address": "14, Turner Road, Bandra West, Mumbai 400050", "desc": "Bandras most sought-after colour studio.", "rating": 4.6, "img": "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"},
  {"id": "s2", "uuid": "a1000001-0000-0000-0000-000000000002", "name": "Kromakay Salons Juhu", "tags": ["balayage", "hair color", "highlights"], "address": "Juhu Supreme Shopping Centre, JVPD Scheme, Juhu, Mumbai 400049", "desc": "A favorite among celebrities for advanced coloring techniques.", "rating": 4.6, "img": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=800"},
  {"id": "s3", "uuid": "a1000001-0000-0000-0000-000000000003", "name": "Toni & Guy Khar", "tags": ["balayage", "hair styling", "hair color"], "address": "Waterfield Road, Khar West, Mumbai 400052", "desc": "International styling expertise and precision cuts.", "rating": 4.4, "img": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=800"},

  # BRIDAL
  {"id": "s4", "uuid": "a1000001-0000-0000-0000-000000000004", "name": "Noor Beauty Studio", "tags": ["bridal makeup", "hd makeup", "arabic makeup"], "address": "22, St. Andrews Road, Bandra West, Mumbai 400050", "desc": "Award-winning makeup studio specialising in bridal HD makeup.", "rating": 4.8, "img": "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=800"},
  {"id": "s5", "uuid": "a1000001-0000-0000-0000-000000000005", "name": "Lakme Salon Powai", "tags": ["bridal makeup", "facial", "waxing"], "address": "Galleria Shopping Mall, Powai, Mumbai 400076", "desc": "Indias most trusted beauty brand for bridal and everyday grooming.", "rating": 4.1, "img": "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?q=80&w=800"},
  {"id": "s6", "uuid": "a1000001-0000-0000-0000-000000000006", "name": "Studio Alizeh", "tags": ["bridal makeup", "arabic makeup", "mehndi"], "address": "8, Linking Road, Khar West, Mumbai 400052", "desc": "Specialises in luxury Arabic bridal packages and intricate braids.", "rating": 4.3, "img": "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?q=80&w=800"},

  # KERATIN
  {"id": "s7", "uuid": "a1000001-0000-0000-0000-000000000007", "name": "The Mane Room", "tags": ["keratin treatment", "voluminous blowout", "glass hair"], "address": "7, 33rd Road, Khar West, Mumbai 400052", "desc": "Specialists in transformative blowouts and Keratin smoothing.", "rating": 4.4, "img": "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=800"},
  {"id": "s8", "uuid": "a1000001-0000-0000-0000-000000000008", "name": "Enrich Salon Andheri", "tags": ["keratin treatment", "hair styling", "facial"], "address": "Shop 4-5, Vastu Enclave, Andheri East, Mumbai 400093", "desc": "Reliable and consistent keratin and beauty services.", "rating": 4.2, "img": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=800"},

  # NAILS
  {"id": "s9", "uuid": "a1000001-0000-0000-0000-000000000009", "name": "The White Door Bandra", "tags": ["nails", "spa", "pedicure", "manicure"], "address": "8, Waterfield Road, Bandra West, Mumbai 400050", "desc": "Luxury bespoke nail and spa boutique with impeccable hygiene.", "rating": 4.7, "img": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800"},
  {"id": "s10", "uuid": "a1000001-0000-0000-0000-000000000010", "name": "Juice Salon Khar", "tags": ["nails", "nail art", "hair color"], "address": "Ground Floor, Vithal Niwas, Khar West, Mumbai 400052", "desc": "Trendy and youthful, known for vibrant colors and expert nail art.", "rating": 4.3, "img": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800"},
  {"id": "s11", "uuid": "a1000001-0000-0000-0000-000000000011", "name": "Nail Bar Colaba", "tags": ["nails", "gel polish", "acrylics"], "address": "Colaba Causeway, Mumbai 400001", "desc": "South Mumbais premier destination for acrylics and nail art.", "rating": 4.5, "img": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800"},

  # HD MAKEUP
  {"id": "s12", "uuid": "a1000001-0000-0000-0000-000000000012", "name": "Bhasin Salon Lokhandwala", "tags": ["hd makeup", "bridal makeup", "party makeup"], "address": "Shop 12, Windermere, Andheri West, Mumbai 400053", "desc": "A local favorite for high-definition party and bridal makeup.", "rating": 4.2, "img": "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?q=80&w=800"},
  {"id": "s13", "uuid": "a1000001-0000-0000-0000-000000000013", "name": "Juhu Glow Spa", "tags": ["hd makeup", "dewy skin", "glass hair"], "address": "27, JVPD Scheme, Juhu, Mumbai 400049", "desc": "HD makeup artists here are regulars on Bollywood sets.", "rating": 4.6, "img": "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=800"},

  # ANTI-FRIZZ
  {"id": "s14", "uuid": "a1000001-0000-0000-0000-000000000014", "name": "Monsoon Glam Andheri", "tags": ["anti-frizz", "keratin treatment", "glass hair"], "address": "12, Versova Road, Andheri West, Mumbai 400061", "desc": "Built by Mumbai, for Mumbais humidity. Pioneers of anti-frizz shields.", "rating": 4.0, "img": "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800"},
  {"id": "s15", "uuid": "a1000001-0000-0000-0000-000000000015", "name": "The Blowout Bar", "tags": ["anti-frizz", "voluminous blowout", "beachy waves"], "address": "55, S.V. Road, Santacruz West, Mumbai 400054", "desc": "Express blowouts and quick anti-frizz rescues for monsoon days.", "rating": 4.1, "img": "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800"},

  # SKIN (Myrah removed, making 19 total)
  {"id": "s16", "uuid": "a1000001-0000-0000-0000-000000000017", "name": "Jean-Claude Biguine Bandra", "tags": ["skin", "spa", "hair styling"], "address": "Turner Road, Bandra West, Mumbai 400050", "desc": "Premium French salon offering exceptional skin and spa services.", "rating": 4.4, "img": "https://images.unsplash.com/photo-1516975080661-460d3d5d7422?q=80&w=800"},
  {"id": "s17", "uuid": "a1000001-0000-0000-0000-000000000018", "name": "Pali Roots", "tags": ["skin", "dewy skin", "organic treatment"], "address": "Pali Hill, Bandra, Mumbai 400050", "desc": "Holistic beauty haven known for organic Ayurvedic skin care.", "rating": 4.5, "img": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800"},

  # MIXED
  {"id": "s18", "uuid": "a1000001-0000-0000-0000-000000000019", "name": "BBlunt Juhu", "tags": ["hair styling", "balayage", "nails"], "address": "Ground Floor, Juhu Tara Road, Mumbai 400049", "desc": "Famous for Bollywood styling and trendy cuts.", "rating": 4.5, "img": "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800"},
  {"id": "s19", "uuid": "a1000001-0000-0000-0000-000000000020", "name": "Crown & Co. Carter", "tags": ["hair styling", "butterfly cut", "balayage"], "address": "18, Carter Road, Bandra West, Mumbai 400050", "desc": "Sea-view salon with a reputation for architectural cuts.", "rating": 4.7, "img": "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=800"}
]

reviewTemplates = [
  # 5 Stars
  {"r": 5, "text": "Absolutely loved my experience! The staff understood exactly what I wanted. The result looks incredibly real and beautiful."},
  {"r": 5, "text": "Incredible service. Looked amazing for my event and the photos came out stunning."},
  {"r": 5, "text": "This is my go-to place now. The vibe is immaculate and the professionals are top-notch. Better than the Instagram pictures!"},
  {"r": 5, "text": "Got the trendy IG look, but unlike other places, it actually looks good in real life too."},
  {"r": 5, "text": "Worth every penny! My friends couldn't stop complimenting me."},
  {"r": 5, "text": "Highly recommend! They used high-quality products and my skin/hair feels so healthy. Very authentic feel."},
  {"r": 5, "text": "Saw their AI generated ad and the real result was even better than the fake photos. True artists."},
  {"r": 5, "text": "My hair feels like silk. They didn't try to oversell me, just gave me exactly what I asked for."},
  
  # 4 Stars
  {"r": 4, "text": "Great results, but I had to wait about 20 minutes past my appointment time. Real life result was great though."},
  {"r": 4, "text": "Very nice place. The styling was spot on, just slightly expensive."},
  {"r": 4, "text": "Good service and nice ambience. The result was exactly like the reference picture I showed."},
  {"r": 4, "text": "Overall solid experience. Clean, professional, and great end results."},
  {"r": 4, "text": "Stylist was very knowledgeable. The final look was 90% of what I wanted, still very happy."},

  # 3 Stars
  {"r": 3, "text": "It was okay. The stylist was nice but the result wasn't quite what I had in mind."},
  {"r": 3, "text": "Decent service but very crowded and noisy. Hard to relax."},
  {"r": 3, "text": "Average. The pictures on their page look like AI, and real life is less glamorous but decent."},
  {"r": 3, "text": "A bit overpriced for the service provided. Not bad, just not amazing."},

  # 2 Stars
  {"r": 2, "text": "Felt very rushed. They tried to upsell me on products the entire time instead of focusing on the service."},
  {"r": 2, "text": "Not impressed. For the price they charge, the quality of service should be much better. Looked fake."},

  # 1 Star
  {"r": 1, "text": "Terrible experience. They completely ruined my look and were rude when I complained."},
  {"r": 1, "text": "I showed a picture of what I wanted and got something completely different. Very disappointed, looked completely unnatural."}
]

sql_str = """-- ================================================================
-- ZURI SEED DATA — 19 Mumbai Salons + 10-15 Reviews Each (Mixed Sentiments)
-- ================================================================

DO $$
DECLARE
  v_owner   uuid;
BEGIN
  -- Get existing user to attach salons/reviews to
  SELECT id INTO v_owner FROM auth.users ORDER BY created_at LIMIT 1;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'No auth users found. Sign up first, then run this script.';
  END IF;

  -- Clean up previous seed data (Using all possible UUIDs from previous scripts)
  DELETE FROM public.reviews  WHERE salon_id IN ('a1000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000002','a1000001-0000-0000-0000-000000000003','a1000001-0000-0000-0000-000000000004','a1000001-0000-0000-0000-000000000005','a1000001-0000-0000-0000-000000000006','a1000001-0000-0000-0000-000000000007','a1000001-0000-0000-0000-000000000008','a1000001-0000-0000-0000-000000000009','a1000001-0000-0000-0000-000000000010','a1000001-0000-0000-0000-000000000011','a1000001-0000-0000-0000-000000000012','a1000001-0000-0000-0000-000000000013','a1000001-0000-0000-0000-000000000014','a1000001-0000-0000-0000-000000000015','a1000001-0000-0000-0000-000000000016','a1000001-0000-0000-0000-000000000017','a1000001-0000-0000-0000-000000000018','a1000001-0000-0000-0000-000000000019','a1000001-0000-0000-0000-000000000020');
  DELETE FROM public.services WHERE salon_id IN ('a1000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000002','a1000001-0000-0000-0000-000000000003','a1000001-0000-0000-0000-000000000004','a1000001-0000-0000-0000-000000000005','a1000001-0000-0000-0000-000000000006','a1000001-0000-0000-0000-000000000007','a1000001-0000-0000-0000-000000000008','a1000001-0000-0000-0000-000000000009','a1000001-0000-0000-0000-000000000010','a1000001-0000-0000-0000-000000000011','a1000001-0000-0000-0000-000000000012','a1000001-0000-0000-0000-000000000013','a1000001-0000-0000-0000-000000000014','a1000001-0000-0000-0000-000000000015','a1000001-0000-0000-0000-000000000016','a1000001-0000-0000-0000-000000000017','a1000001-0000-0000-0000-000000000018','a1000001-0000-0000-0000-000000000019','a1000001-0000-0000-0000-000000000020');
  DELETE FROM public.salons   WHERE id       IN ('a1000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000002','a1000001-0000-0000-0000-000000000003','a1000001-0000-0000-0000-000000000004','a1000001-0000-0000-0000-000000000005','a1000001-0000-0000-0000-000000000006','a1000001-0000-0000-0000-000000000007','a1000001-0000-0000-0000-000000000008','a1000001-0000-0000-0000-000000000009','a1000001-0000-0000-0000-000000000010','a1000001-0000-0000-0000-000000000011','a1000001-0000-0000-0000-000000000012','a1000001-0000-0000-0000-000000000013','a1000001-0000-0000-0000-000000000014','a1000001-0000-0000-0000-000000000015','a1000001-0000-0000-0000-000000000016','a1000001-0000-0000-0000-000000000017','a1000001-0000-0000-0000-000000000018','a1000001-0000-0000-0000-000000000019','a1000001-0000-0000-0000-000000000020');

  -- INSERT SALONS
  INSERT INTO public.salons (id, owner_id, name, style_tags, address, about, rating, images, contact_info, operating_hours) VALUES
"""

salon_rows = []
for s in salons:
    tags_str = ",".join(f"'{t}'" for t in s['tags'])
    name_escaped = s['name'].replace("'", "''")
    desc_escaped = s['desc'].replace("'", "''")
    address_escaped = s['address'].replace("'", "''")
    row = f"  ('{s['uuid']}', v_owner, '{name_escaped}', ARRAY[{tags_str}], '{address_escaped}', '{desc_escaped}', {s['rating']}, ARRAY['{s['img']}'], '{{\"phone\":\"+91 99999 99999\"}}'::jsonb, '{{\"mon_fri\":\"10:00 AM – 8:00 PM\"}}'::jsonb)"
    salon_rows.append(row)

sql_str += ",\n".join(salon_rows) + ";\n\n"

sql_str += """  -- INSERT SERVICES
  INSERT INTO public.services (salon_id, name, price, duration) VALUES
"""

service_rows = []
for s in salons:
    service_rows.append(f"  ('{s['uuid']}', 'Signature Service', 2500, '60 min'), ('{s['uuid']}', 'Premium Treatment', 4500, '90 min')")

sql_str += ",\n".join(service_rows) + ";\n\n"

sql_str += """  -- INSERT REVIEWS (10-15 mixed reviews per salon)
  INSERT INTO public.reviews (user_id, salon_id, rating, text, created_at) VALUES
"""

review_rows = []
for s in salons:
    num_reviews = random.randint(10, 15)
    for _ in range(num_reviews):
        template = random.choice(reviewTemplates)
        days_ago = random.randint(1, 100)
        text_escaped = template['text'].replace("'", "''")
        review_rows.append(f"  (v_owner, '{s['uuid']}', {template['r']}, '{text_escaped}', NOW()-INTERVAL '{days_ago} days')")

sql_str += ",\n".join(review_rows) + ";\n\n"

sql_str += f"""  RAISE NOTICE 'Seed complete: {len(salons)} salons, services, and {len(review_rows)} reviews inserted.';
END $$;
"""

with open("c:/Users/MOHD ABBAS/.gemini/antigravity-ide/brain/cf6f5f9c-6c3c-4e1e-8189-64d0592c7552/seed_salons.sql", "w", encoding="utf-8") as f:
    f.write(sql_str)

print("Seed file created successfully via Python!")
