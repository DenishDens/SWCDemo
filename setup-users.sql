-- Clean existing data from auth tables
TRUNCATE auth.users CASCADE;

-- Create admin user
DO $$
BEGIN
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    'be88de73-52bd-4043-bb2f-9ce9e13d3465',
    '00000000-0000-0000-0000-000000000000'::uuid,
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Test User"}'
  );

  -- Create identity for the user
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    'be88de73-52bd-4043-bb2f-9ce9e13d3465',
    'test@example.com',
    'be88de73-52bd-4043-bb2f-9ce9e13d3465',
    '{"sub":"be88de73-52bd-4043-bb2f-9ce9e13d3465","email":"test@example.com"}',
    'email',
    now(),
    now(),
    now()
  );
END $$; 