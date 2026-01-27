-- Allow users to insert their own role during signup (bootstrap)
-- This policy allows a user to create their own role entry
CREATE POLICY "Users can create their own role on signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);