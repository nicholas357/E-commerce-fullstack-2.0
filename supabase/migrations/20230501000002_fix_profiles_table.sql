-- Check if the profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Ensure RLS policies are set correctly
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Policy for service role to manage all profiles
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
CREATE POLICY "Service role can manage all profiles" 
  ON profiles 
  USING (auth.role() = 'service_role');

-- Policy for inserting profiles (needed for signup)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
CREATE POLICY "Enable insert for authenticated users only" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;

-- Grant all permissions to service_role
GRANT ALL ON profiles TO service_role;
