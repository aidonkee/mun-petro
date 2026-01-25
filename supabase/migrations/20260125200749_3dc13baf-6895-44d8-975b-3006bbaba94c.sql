-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'delegate');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 6. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Add user_id to submissions table
ALTER TABLE public.submissions 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 8. Drop existing permissive policies on submissions
DROP POLICY IF EXISTS "Anyone can delete submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can read submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can update submissions" ON public.submissions;

-- 9. Create proper RLS policies for submissions
-- Delegates can only see their own submissions
CREATE POLICY "Delegates can view own submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- Delegates can only insert their own submissions
CREATE POLICY "Delegates can create own submissions"
ON public.submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Delegates can update their own non-graded submissions
CREATE POLICY "Delegates can update own draft submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = user_id AND status = 'draft')
  OR public.has_role(auth.uid(), 'admin')
);

-- Only admins can delete submissions
CREATE POLICY "Only admins can delete submissions"
ON public.submissions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Drop existing permissive policies on quiz_configs
DROP POLICY IF EXISTS "Anyone can delete quiz configs" ON public.quiz_configs;
DROP POLICY IF EXISTS "Anyone can insert quiz configs" ON public.quiz_configs;
DROP POLICY IF EXISTS "Anyone can read quiz configs" ON public.quiz_configs;
DROP POLICY IF EXISTS "Anyone can update quiz configs" ON public.quiz_configs;

-- 11. Create proper RLS policies for quiz_configs
-- Everyone can read quiz configs
CREATE POLICY "Authenticated users can read quiz configs"
ON public.quiz_configs
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify quiz configs
CREATE POLICY "Only admins can insert quiz configs"
ON public.quiz_configs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update quiz configs"
ON public.quiz_configs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete quiz configs"
ON public.quiz_configs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 12. Drop existing permissive policies on quiz_questions
DROP POLICY IF EXISTS "Anyone can delete quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Anyone can insert quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Anyone can read quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Anyone can update quiz questions" ON public.quiz_questions;

-- 13. Create a view for quiz questions that hides correct answers for delegates
CREATE VIEW public.quiz_questions_public
WITH (security_invoker=on) AS
  SELECT id, config_id, question, question_type, options, order_index, explanation, created_at
  FROM public.quiz_questions;

-- 14. RLS policies for quiz_questions base table - only admins can access directly
CREATE POLICY "Only admins can read quiz questions directly"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert quiz questions"
ON public.quiz_questions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update quiz questions"
ON public.quiz_questions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete quiz questions"
ON public.quiz_questions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 15. Grant access to the public view for authenticated users
GRANT SELECT ON public.quiz_questions_public TO authenticated;

-- 16. Create a function to validate quiz answers (so delegates never see correct answers)
CREATE OR REPLACE FUNCTION public.check_quiz_answer(question_id uuid, selected_answer integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT correct_answer = selected_answer
  FROM public.quiz_questions
  WHERE id = question_id
$$;