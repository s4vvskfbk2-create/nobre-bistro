-- Create RPC function to reset admin password
-- This allows the reset-password.html page to update the admin password

CREATE OR REPLACE FUNCTION reset_admin_password(new_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hashed_pwd text;
BEGIN
  -- Validate input
  IF new_password IS NULL OR new_password = '' THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Password cannot be empty');
  END IF;

  IF length(new_password) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Password must be at least 3 characters');
  END IF;

  -- Hash the password using pgcrypto
  hashed_pwd := crypt(new_password, gen_salt('bf', 10));

  -- Update the config table with new hashed password
  INSERT INTO config (key, value)
  VALUES ('admin_password_hash', hashed_pwd)
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now();

  RETURN jsonb_build_object('ok', true, 'message', 'Password updated successfully');
EXCEPTION WHEN others THEN
  RETURN jsonb_build_object('ok', false, 'message', 'Error updating password: ' || SQLERRM);
END;
$$;

-- Grant access to anon users (for the reset page)
GRANT EXECUTE ON FUNCTION reset_admin_password(text) TO anon, authenticated;
