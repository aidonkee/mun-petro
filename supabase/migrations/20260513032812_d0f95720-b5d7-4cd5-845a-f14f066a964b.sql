
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS expected_answer text;

ALTER TABLE public.quiz_questions
  ALTER COLUMN correct_answer DROP NOT NULL;

ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS open_responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pending_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_score integer,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewer_feedback text;

-- Allow admin to update quiz_results to grade open answers
DROP POLICY IF EXISTS "Admins can update quiz results" ON public.quiz_results;
CREATE POLICY "Admins can update quiz results"
  ON public.quiz_results
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Recreate public view to include expected_answer omitted, but include all safe fields
DROP VIEW IF EXISTS public.quiz_questions_public;
CREATE VIEW public.quiz_questions_public
WITH (security_invoker=on) AS
  SELECT id, config_id, question, question_type, options, explanation, order_index, created_at
  FROM public.quiz_questions;

GRANT SELECT ON public.quiz_questions_public TO authenticated, anon;

-- Update check_quiz_answer to handle open_ended (returns false for open ended; client knows)
CREATE OR REPLACE FUNCTION public.check_quiz_answer(question_id uuid, selected_answer integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN (SELECT question_type FROM public.quiz_questions WHERE id = question_id) = 'open_ended'
      THEN false
    ELSE (SELECT correct_answer = selected_answer FROM public.quiz_questions WHERE id = question_id)
  END
$function$;
