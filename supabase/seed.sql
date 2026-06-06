-- VeloxLane dev seed: 2 sellers, 5 listings across FL + TX
-- Applied after migrations via `supabase db reset`

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fixed UUIDs for reproducible local dev
-- Sellers
--   a1111111-1111-4111-8111-111111111101  seller.fl@veloxlane.dev (Florida)
--   a1111111-1111-4111-8111-111111111102  seller.tx@veloxlane.dev (Texas)

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-1111-4111-8111-111111111101',
    'authenticated',
    'authenticated',
    'seller.fl@veloxlane.dev',
    crypt('veloxlane-dev', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-1111-4111-8111-111111111102',
    'authenticated',
    'authenticated',
    'seller.tx@veloxlane.dev',
    crypt('veloxlane-dev', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    'a1111111-1111-4111-8111-111111111101',
    'a1111111-1111-4111-8111-111111111101',
    jsonb_build_object('sub', 'a1111111-1111-4111-8111-111111111101', 'email', 'seller.fl@veloxlane.dev'),
    'email',
    'a1111111-1111-4111-8111-111111111101',
    now(),
    now(),
    now()
  ),
  (
    'a1111111-1111-4111-8111-111111111102',
    'a1111111-1111-4111-8111-111111111102',
    jsonb_build_object('sub', 'a1111111-1111-4111-8111-111111111102', 'email', 'seller.tx@veloxlane.dev'),
    'email',
    'a1111111-1111-4111-8111-111111111102',
    now(),
    now(),
    now()
  )
ON CONFLICT (provider_id, provider) DO NOTHING;

-- Profiles are created by handle_new_user trigger; enrich dev fields
UPDATE public.profiles
SET
  role = 'seller',
  phone = '+13055550101'
WHERE id = 'a1111111-1111-4111-8111-111111111101';

UPDATE public.profiles
SET
  role = 'seller',
  phone = '+15125550102'
WHERE id = 'a1111111-1111-4111-8111-111111111102';

INSERT INTO public.listings (
  id,
  seller_id,
  vin,
  make,
  model,
  year,
  mileage,
  price,
  description,
  status,
  escrow_fee_mode,
  location,
  state,
  photos_count,
  published_at
)
VALUES
  (
    'b2222222-2222-4222-8222-222222222201',
    'a1111111-1111-4111-8111-111111111101',
    '1HGBH41JXMN109186',
    'Honda',
    'Civic',
    2019,
    42000,
    16500.00,
    'One-owner Florida commuter. Clean CARFAX, non-smoker, garage kept.',
    'active',
    'buyer',
    'Miami, FL',
    'FL',
    3,
    now() - interval '3 days'
  ),
  (
    'b2222222-2222-4222-8222-222222222202',
    'a1111111-1111-4111-8111-111111111101',
    '5YJSA1E26MF123456',
    'Tesla',
    'Model 3',
    2021,
    28000,
    28900.00,
    'Long Range AWD with Autopilot. Tampa area, private sale.',
    'active',
    'split',
    'Tampa, FL',
    'FL',
    5,
    now() - interval '1 day'
  ),
  (
    'b2222222-2222-4222-8222-222222222203',
    'a1111111-1111-4111-8111-111111111101',
    '1FTFW1E84MFA12345',
    'Ford',
    'F-150',
    2020,
    55000,
    34500.00,
    'XLT SuperCrew 4x4. Orlando work truck, well maintained.',
    'draft',
    'seller',
    'Orlando, FL',
    'FL',
    0,
    NULL
  ),
  (
    'b2222222-2222-4222-8222-222222222204',
    'a1111111-1111-4111-8111-111111111102',
    '1G1BE5SM7H7123456',
    'Chevrolet',
    'Camaro',
    2018,
    31000,
    24500.00,
    'SS coupe, Austin garage kept. Private party only.',
    'active',
    'buyer',
    'Austin, TX',
    'TX',
    4,
    now() - interval '5 days'
  ),
  (
    'b2222222-2222-4222-8222-222222222205',
    'a1111111-1111-4111-8111-111111111102',
    '1N4AL3AP8JC123456',
    'Nissan',
    'Altima',
    2017,
    67000,
    11900.00,
    'Reliable daily driver in Dallas. New tires, fresh oil change.',
    'active',
    'buyer',
    'Dallas, TX',
    'TX',
    2,
    now() - interval '2 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.photos (
  id,
  listing_id,
  storage_path,
  processed_path,
  plate_detected,
  plate_cover_status,
  angle_slot,
  approved,
  source
)
VALUES
  (
    'c3333333-3333-4333-8333-333333333301',
    'b2222222-2222-4222-8222-222222222201',
    'private/listings/b2222222-2222-4222-8222-222222222201/angle-01-original.jpg',
    'https://cdn.veloxlane.dev/processed/b2222222-2222-4222-8222-222222222201/angle-01.jpg',
    true,
    'completed',
    1,
    true,
    'guided'
  ),
  (
    'c3333333-3333-4333-8333-333333333302',
    'b2222222-2222-4222-8222-222222222204',
    'private/listings/b2222222-2222-4222-8222-222222222204/angle-01-original.jpg',
    'https://cdn.veloxlane.dev/processed/b2222222-2222-4222-8222-222222222204/angle-01.jpg',
    true,
    'completed',
    1,
    true,
    'guided'
  )
ON CONFLICT (id) DO NOTHING;
