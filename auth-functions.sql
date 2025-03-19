-- Create a function to list auth users
CREATE OR REPLACE FUNCTION public.list_auth_users()
RETURNS TABLE (
  id uuid,
  email text,
  encrypted_password text,
  created_at timestamptz,
  provider text
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.email,
    u.encrypted_password,
    u.created_at,
    i.provider
  FROM auth.users u
  LEFT JOIN auth.identities i ON u.id = i.user_id;
$$; 