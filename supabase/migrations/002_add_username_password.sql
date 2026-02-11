-- Add username and password_hash columns to users table for custom authentication
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash text;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Update RLS policies to allow users to update their own password
CREATE POLICY "Users can update their own password"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id OR role() = 'service_role')
  WITH CHECK (auth.uid() = id OR role() = 'service_role');

-- Allow service role to create users with passwords (for signup)
CREATE POLICY "Service role can create users with passwords"
  ON public.users
  FOR INSERT
  WITH CHECK (role() = 'service_role');
