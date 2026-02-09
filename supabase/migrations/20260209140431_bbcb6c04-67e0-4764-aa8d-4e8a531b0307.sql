
-- Add login credentials columns to delegate_profiles
ALTER TABLE public.delegate_profiles 
ADD COLUMN login_email text,
ADD COLUMN login_password text;

-- Update RLS: admins can see all profiles including credentials
-- (existing policies should already allow admin access via has_role)
