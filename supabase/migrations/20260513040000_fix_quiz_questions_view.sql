-- Recreate public view WITHOUT security_invoker=on so it bypasses RLS
-- This is necessary because the base table public.quiz_questions
-- only allows admins to SELECT from it.

DROP VIEW IF EXISTS public.quiz_questions_public;
CREATE VIEW public.quiz_questions_public AS
  SELECT id, config_id, question, question_type, options, explanation, order_index, created_at
  FROM public.quiz_questions;

GRANT SELECT ON public.quiz_questions_public TO authenticated, anon;
