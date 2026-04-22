-- ─────────────────────────────────────────────────────────────────────────────
-- AqarAI — Demo Seed Properties
-- 12 realistic Iraqi properties across Erbil, Baghdad, Mosul, Sulaymaniyah
-- Uses a fixed demo user UUID so properties show up without real auth
-- ─────────────────────────────────────────────────────────────────────────────
-- Create a demo seller profile (used as owner for all seed listings)
-- This is a service-role insert bypassing RLS — only runs at migration time
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert demo user into auth.users if it doesn't exist
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    aud, role
  )
  VALUES (
    demo_user_id,
    'demo@aqarai.iq',
    crypt('AqarAI_Demo2026!', gen_salt('bf')),
    now(),
    '{"display_name":"AqarAI Demo","role":"seller"}'::jsonb,
    now(), now(),
    'authenticated', 'authenticated'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (demo_user_id, 'AqarAI Demo Listings')
  ON CONFLICT (user_id) DO NOTHING;

  -- Role
  -- Ensure unique constraint exists before using ON CONFLICT
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_role_key'
      AND conrelid = 'public.user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (demo_user_id, 'seller')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- ─── Seed properties ──────────────────────────────────────────────────────────
INSERT INTO public.properties (
  id, user_id, title, title_ar, description, description_ar,
  price, price_iqd, currency, type, property_type,
  city, district, bedrooms, bathrooms, area,
  latitude, longitude, terra_score, ai_valuation, ai_confidence,
  verified, agent_name, agent_verified, features, status, views
) VALUES
-- 1. Erbil — Luxury Villa, Ankawa
(
  'a1000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Luxury Villa with Private Pool — Ankawa',
  'فيلا فاخرة مع مسبح خاص — عنكاوا',
  'Stunning 5-bedroom luxury villa in the heart of Ankawa, featuring a private heated pool, landscaped garden, smart home system, and panoramic city views. Recently renovated with Italian marble flooring throughout.',
  'فيلا فاخرة مذهلة من 5 غرف نوم في قلب عنكاوا، تتميز بمسبح خاص مدفأ وحديقة منسقة ونظام منزل ذكي وإطلالات بانورامية على المدينة.',
  650000, 850000000, 'USD', 'sale', 'Villa',
  'Erbil', 'Ankawa', 5, 4, 450,
  36.2102, 43.9834, 94, 680000, 'high',
  true, 'Karwan Abdullah', true,
  ARRAY['Swimming Pool','Garden','Smart Home','Security System','Garage','Elevator','24/7 Security','Premium Finishes','Central AC','Generator'],
  'active', 342
),
-- 2. Erbil — Modern Apartment, Gulan
(
  'a1000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Modern 3-Bed Apartment — Gulan Street',
  'شقة حديثة 3 غرف — شارع گولان',
  'Bright and spacious 3-bedroom apartment on the 7th floor of a prestigious building on Gulan Street. Features floor-to-ceiling windows, balcony with city views, and underground parking. Walking distance to malls and restaurants.',
  'شقة مضيئة وفسيحة من 3 غرف نوم في الطابق السابع من مبنى مرموق في شارع گولان. تتميز بنوافذ من الأرض للسقف وشرفة مطلة على المدينة.',
  220000, 287000000, 'USD', 'sale', 'Apartment',
  'Erbil', 'Gulan', 3, 2, 185,
  36.1975, 44.0087, 88, 235000, 'high',
  true, 'Srwa Hassan', true,
  ARRAY['Balcony','Parking','Elevator','Security System','Fiber Internet','Central AC'],
  'active', 218
),
-- 3. Erbil — Penthouse, Ainkawa
(
  'a1000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Executive Penthouse — Ainkawa Heights',
  'بنتهاوس تنفيذي — عينكاوا هايتس',
  'Exceptional top-floor penthouse with 360° views across Erbil. 4 bedrooms, private rooftop terrace, jacuzzi, and dedicated concierge service. Only 2 units in the building. Ideal for executives and investors.',
  'بنتهاوس استثنائي في الطابق العلوي مع إطلالات 360 درجة على أربيل. 4 غرف نوم وسطح خاص وجاكوزي وخدمة كونسيرج مخصصة.',
  480000, 626000000, 'USD', 'sale', 'Penthouse',
  'Erbil', 'Ainkawa', 4, 3, 320,
  36.2201, 43.9756, 96, 510000, 'high',
  true, 'Diyar Rashid', true,
  ARRAY['Private Elevator','360° Virtual Tour','Concierge Service','Smart Home','Generator','Premium Finishes','Terrace','Central AC','Security System'],
  'active', 487
),
-- 4. Baghdad — Karrada Apartment
(
  'a1000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'Renovated Apartment in Karrada — City Views',
  'شقة مجددة في الكرادة — إطلالة على المدينة',
  'Fully renovated 2-bedroom apartment in the prestigious Karrada district. New kitchen and bathrooms, parquet flooring, and a large balcony overlooking the Tigris River. Close to international schools and embassies.',
  'شقة من غرفتي نوم تم تجديدها بالكامل في حي الكرادة المرموق. مطبخ وحمامات جديدة وأرضيات باركيه وشرفة كبيرة مطلة على نهر دجلة.',
  155000, 202000000, 'USD', 'sale', 'Apartment',
  'Baghdad', 'Karrada', 2, 2, 140,
  33.3152, 44.4040, 82, 165000, 'medium',
  true, 'Ahmed Al-Rashid', true,
  ARRAY['Balcony','Parking','Elevator','Central AC','Security System'],
  'active', 156
),
-- 5. Baghdad — Mansour Villa
(
  'a1000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Classic Villa — Mansour District',
  'فيلا كلاسيكية — حي المنصور',
  'Elegant 4-bedroom villa in the upscale Mansour district, one of Baghdad oldest and most prestigious neighborhoods. Features traditional Iraqi architectural elements, private courtyard, and mature garden. Walking distance to Al-Mansour Mall.',
  'فيلا أنيقة من 4 غرف نوم في حي المنصور الراقي، أحد أعرق أحياء بغداد وأكثرها مكانة. تتميز بعناصر معمارية عراقية تقليدية وباحة خاصة وحديقة ناضجة.',
  320000, 417000000, 'USD', 'sale', 'Villa',
  'Baghdad', 'Mansour', 4, 3, 380,
  33.3336, 44.3661, 85, 335000, 'medium',
  false, 'Omar Al-Tikrity', false,
  ARRAY['Garden','Garage','Security System','Generator','Parking'],
  'active', 203
),
-- 6. Baghdad — Jadriya Townhouse
(
  'a1000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'Modern Townhouse — Jadriya',
  'تاون هاوس حديث — الجادرية',
  'Contemporary 3-bedroom townhouse in Jadriya, one of Baghdad greenest and safest areas near Baghdad University. Three floors with rooftop terrace, modern kitchen, and private parking. Perfect for young families.',
  'تاون هاوس معاصر من 3 غرف نوم في الجادرية، من أكثر مناطق بغداد خضرة وأمانًا بالقرب من جامعة بغداد.',
  195000, 254000000, 'USD', 'sale', 'Townhouse',
  'Baghdad', 'Jadriya', 3, 3, 210,
  33.2784, 44.3866, 80, 205000, 'medium',
  false, 'Sara Al-Khatib', false,
  ARRAY['Terrace','Parking','Generator','Central AC'],
  'active', 98
),
-- 7. Sulaymaniyah — Bakhtiari Apartment
(
  'a1000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000001',
  'Mountain-View Apartment — Bakhtiari',
  'شقة بإطلالة جبلية — بختياري',
  'Bright 3-bedroom apartment with spectacular mountain views in the upscale Bakhtiari area. Modern open-plan design, marble flooring, and large wraparound balcony. The Sulaymaniyah Bazaar and cultural sites are nearby.',
  'شقة مضيئة من 3 غرف نوم مع إطلالات جبلية رائعة في منطقة بختياري الراقية. تصميم حديث مفتوح وأرضيات رخامية وشرفة كبيرة.',
  185000, 241000000, 'USD', 'sale', 'Apartment',
  'Sulaymaniyah', 'Bakhtiari', 3, 2, 170,
  35.5571, 45.4235, 87, 195000, 'high',
  true, 'Bestan Jamal', true,
  ARRAY['Balcony','Elevator','Central AC','Security System','Parking','Fiber Internet'],
  'active', 267
),
-- 8. Sulaymaniyah — Qadisiyah Villa
(
  'a1000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'Family Villa — Qadisiyah, Sulaymaniyah',
  'فيلا عائلية — القادسية، السليمانية',
  'Spacious 5-bedroom family villa in the quiet Qadisiyah neighborhood. Large garden with mature trees, outdoor entertaining area, and 3-car garage. Newly installed solar panels reduce utility costs significantly.',
  'فيلا عائلية فسيحة من 5 غرف نوم في حي القادسية الهادئ. حديقة كبيرة بأشجار ناضجة ومنطقة ترفيه خارجية وجراج لـ 3 سيارات.',
  290000, 378000000, 'USD', 'sale', 'Villa',
  'Sulaymaniyah', 'Qadisiyah', 5, 4, 420,
  35.5433, 45.4019, 83, 305000, 'medium',
  false, 'Chnar Othman', false,
  ARRAY['Garden','Garage','Solar Panels','Generator','Security System','Parking'],
  'active', 134
),
-- 9. Mosul — Al-Dawasa Commercial
(
  'a1000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  'Commercial Unit — Al-Dawasa, Mosul',
  'وحدة تجارية — الدواسة، الموصل',
  'Prime commercial unit on the main Al-Dawasa street, the commercial heart of Mosul. 120m² ground floor with large display windows, back storage room, and private parking for 4 vehicles. Currently tenanted at $1,200/month.',
  'وحدة تجارية رئيسية في شارع الدواسة الرئيسي، قلب الموصل التجاري. طابق أرضي مساحته 120 متر مربع مع نوافذ عرض كبيرة وغرفة تخزين خلفية.',
  95000, 123900000, 'USD', 'sale', 'Commercial',
  'Mosul', 'Al-Dawasa', 0, 1, 120,
  36.3413, 43.1381, 75, 102000, 'medium',
  false, 'Taif Al-Mosuli', false,
  ARRAY['Parking','Security System','Fiber Internet'],
  'active', 89
),
-- 10. Erbil — Land Plot, Shorsh
(
  'a1000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Residential Land Plot — Shorsh, Erbil',
  'قطعة أرض سكنية — شورش، أربيل',
  'Level residential land plot of 600m² in the rapidly developing Shorsh area. All utilities connected (water, electricity, sewage). Surrounded by completed villas. Planning permission for up to 3 floors. Ideal for private home or small development.',
  'قطعة أرض سكنية مستوية مساحتها 600 متر مربع في منطقة شورش سريعة التطور. جميع المرافق متصلة (ماء، كهرباء، صرف صحي).',
  110000, 143500000, 'USD', 'sale', 'Land',
  'Erbil', 'Shorsh', 0, 0, 600,
  36.1743, 44.0325, 78, 118000, 'medium',
  false, 'Nawzad Ibrahim', false,
  ARRAY[],
  'active', 145
),
-- 11. Erbil — Apartment for Rent, Gulan
(
  'a1000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  '2-Bedroom Apartment for Rent — Gulan',
  'شقة غرفتين للإيجار — گولان',
  'Well-maintained 2-bedroom apartment available for rent on Gulan Street. Furnished option available. Building has 24/7 security and maintenance. Ideal for expats, diplomats, or young professionals.',
  'شقة جيدة الصيانة من غرفتين متاحة للإيجار في شارع گولان. خيار مفروش متاح. المبنى مؤمن على مدار الساعة.',
  1800, 2350000, 'USD', 'rent', 'Apartment',
  'Erbil', 'Gulan', 2, 1, 120,
  36.1969, 44.0071, 84, 0, 'low',
  true, 'Naz Aziz', true,
  ARRAY['Elevator','Security System','Central AC','Parking','Fiber Internet'],
  'active', 312
),
-- 12. Baghdad — Zayouna Office
(
  'a1000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'Premium Office Space — Zayouna',
  'مكتب فاخر — الزيونة',
  'Modern open-plan office on the 4th floor of a Class-A building in Zayouna Business District. 200m² fully fitted with meeting rooms, reception area, and fiber internet. Monthly rent includes building maintenance and security.',
  'مكتب حديث مفتوح في الطابق الرابع من مبنى من الدرجة الأولى في منطقة الزيونة التجارية. 200 متر مربع مجهز بالكامل مع غرف اجتماعات ومنطقة استقبال.',
  3500, 4565000, 'USD', 'rent', 'Office',
  'Baghdad', 'Zayouna', 0, 2, 200,
  33.3583, 44.4412, 79, 0, 'low',
  false, 'Mustafa Al-Zayouni', false,
  ARRAY['Elevator','Security System','Fiber Internet','Conference Room','Central AC','Parking'],
  'active', 76
)
ON CONFLICT (id) DO NOTHING;
