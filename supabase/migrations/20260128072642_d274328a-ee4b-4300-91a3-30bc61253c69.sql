-- ===================================================
-- MUN ASSESSMENT PLATFORM - COMPREHENSIVE EXTENSION
-- ===================================================

-- ===================================================
-- 1. ENUM TYPES
-- ===================================================

-- Enum for motion types
DO $$ BEGIN
  CREATE TYPE public.motion_type AS ENUM (
    'moderated_caucus',
    'unmoderated_caucus',
    'close_debate',
    'suspend_meeting',
    'adjourn_meeting',
    'introduce_draft_resolution',
    'divide_the_question'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enum for point types
DO $$ BEGIN
  CREATE TYPE public.point_type AS ENUM (
    'point_of_order',
    'point_of_information',
    'point_of_personal_privilege',
    'point_of_inquiry',
    'right_of_reply'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enum for vote options
DO $$ BEGIN
  CREATE TYPE public.vote_option AS ENUM ('for', 'against', 'abstain');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enum for speech types
DO $$ BEGIN
  CREATE TYPE public.speech_type AS ENUM (
    'opening_speech',
    'moderated_caucus',
    'formal_debate',
    'rebuttal',
    'closing_statement'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enum for amendment types
DO $$ BEGIN
  CREATE TYPE public.amendment_type AS ENUM ('friendly', 'unfriendly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enum for sponsor roles
DO $$ BEGIN
  CREATE TYPE public.sponsor_role AS ENUM ('main_sponsor', 'co_sponsor', 'signatory');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enum for assessment categories
DO $$ BEGIN
  CREATE TYPE public.assessment_category AS ENUM (
    'procedural_knowledge',
    'engagement_discussion',
    'resolution_work',
    'academic_quality',
    'self_reflection'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enum for rubric levels
DO $$ BEGIN
  CREATE TYPE public.rubric_level AS ENUM ('beginning', 'developing', 'proficient');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===================================================
-- 2. DELEGATE PROFILES
-- ===================================================
CREATE TABLE IF NOT EXISTS public.delegate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  delegate_name TEXT NOT NULL,
  country TEXT NOT NULL,
  committee TEXT NOT NULL DEFAULT 'General Assembly',
  conference_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delegate_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delegates can view own profile" ON public.delegate_profiles;
CREATE POLICY "Delegates can view own profile"
ON public.delegate_profiles FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delegates can create own profile" ON public.delegate_profiles;
CREATE POLICY "Delegates can create own profile"
ON public.delegate_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delegates can update own profile" ON public.delegate_profiles;
CREATE POLICY "Delegates can update own profile"
ON public.delegate_profiles FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.delegate_profiles;
CREATE POLICY "Only admins can delete profiles"
ON public.delegate_profiles FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 3. PROCEDURAL ACTIONS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.procedural_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('motion', 'point')),
  motion_type motion_type,
  point_type point_type,
  description TEXT,
  is_successful BOOLEAN DEFAULT NULL,
  procedure_followed BOOLEAN DEFAULT NULL,
  teacher_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.procedural_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delegates can view own procedural actions" ON public.procedural_actions;
CREATE POLICY "Delegates can view own procedural actions"
ON public.procedural_actions FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delegates can create own procedural actions" ON public.procedural_actions;
CREATE POLICY "Delegates can create own procedural actions"
ON public.procedural_actions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can update procedural actions" ON public.procedural_actions;
CREATE POLICY "Only admins can update procedural actions"
ON public.procedural_actions FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete procedural actions" ON public.procedural_actions;
CREATE POLICY "Only admins can delete procedural actions"
ON public.procedural_actions FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 4. VOTING RECORDS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.voting_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vote_subject TEXT NOT NULL,
  vote_subject_type TEXT NOT NULL CHECK (vote_subject_type IN ('motion', 'resolution', 'amendment')),
  related_resolution_id UUID,
  vote vote_option NOT NULL,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voting_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delegates can view own voting records" ON public.voting_records;
CREATE POLICY "Delegates can view own voting records"
ON public.voting_records FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delegates can create own votes" ON public.voting_records;
CREATE POLICY "Delegates can create own votes"
ON public.voting_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can delete votes" ON public.voting_records;
CREATE POLICY "Only admins can delete votes"
ON public.voting_records FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 5. SPEECHES (Enhanced)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.speeches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  speech_type speech_type NOT NULL DEFAULT 'opening_speech',
  title TEXT,
  content TEXT NOT NULL,
  speaking_time_seconds INTEGER NOT NULL DEFAULT 0,
  minimum_time_seconds INTEGER NOT NULL DEFAULT 60,
  referenced_country TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded')),
  score NUMERIC(4,2),
  feedback TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.speeches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delegates can view own speeches" ON public.speeches;
CREATE POLICY "Delegates can view own speeches"
ON public.speeches FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delegates can create own speeches" ON public.speeches;
CREATE POLICY "Delegates can create own speeches"
ON public.speeches FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delegates can update own draft speeches" ON public.speeches;
CREATE POLICY "Delegates can update own draft speeches"
ON public.speeches FOR UPDATE
USING ((auth.uid() = user_id AND status = 'draft') OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete speeches" ON public.speeches;
CREATE POLICY "Only admins can delete speeches"
ON public.speeches FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 6. POSITION PAPERS (Structured)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.position_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  background_section TEXT NOT NULL DEFAULT '',
  country_position_section TEXT NOT NULL DEFAULT '',
  alternative_viewpoints_section TEXT NOT NULL DEFAULT '',
  proposed_solutions_section TEXT NOT NULL DEFAULT '',
  sources JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded')),
  score NUMERIC(4,2),
  feedback TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.position_papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delegates can view own position papers" ON public.position_papers;
CREATE POLICY "Delegates can view own position papers"
ON public.position_papers FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delegates can create own position papers" ON public.position_papers;
CREATE POLICY "Delegates can create own position papers"
ON public.position_papers FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delegates can update own draft position papers" ON public.position_papers;
CREATE POLICY "Delegates can update own draft position papers"
ON public.position_papers FOR UPDATE
USING ((auth.uid() = user_id AND status = 'draft') OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete position papers" ON public.position_papers;
CREATE POLICY "Only admins can delete position papers"
ON public.position_papers FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 7. RESOLUTIONS (Extended)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  committee TEXT,
  clauses JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded', 'adopted', 'failed')),
  score NUMERIC(4,2),
  feedback TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  presented BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view submitted resolutions" ON public.resolutions;
CREATE POLICY "Anyone can view submitted resolutions"
ON public.resolutions FOR SELECT
USING (status != 'draft' OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delegates can create own resolutions" ON public.resolutions;
CREATE POLICY "Delegates can create own resolutions"
ON public.resolutions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delegates can update own draft resolutions" ON public.resolutions;
CREATE POLICY "Delegates can update own draft resolutions"
ON public.resolutions FOR UPDATE
USING ((auth.uid() = user_id AND status = 'draft') OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete resolutions" ON public.resolutions;
CREATE POLICY "Only admins can delete resolutions"
ON public.resolutions FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 8. RESOLUTION SPONSORS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.resolution_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES public.resolutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role sponsor_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resolution_id, user_id)
);

ALTER TABLE public.resolution_sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view resolution sponsors" ON public.resolution_sponsors;
CREATE POLICY "Anyone can view resolution sponsors"
ON public.resolution_sponsors FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Delegates can add themselves as sponsor" ON public.resolution_sponsors;
CREATE POLICY "Delegates can add themselves as sponsor"
ON public.resolution_sponsors FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can delete sponsors" ON public.resolution_sponsors;
CREATE POLICY "Only admins can delete sponsors"
ON public.resolution_sponsors FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 9. AMENDMENTS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES public.resolutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amendment_type amendment_type NOT NULL,
  clause_index INTEGER NOT NULL,
  original_text TEXT,
  proposed_text TEXT NOT NULL,
  rationale TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.amendments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delegates can view amendments" ON public.amendments;
CREATE POLICY "Delegates can view amendments"
ON public.amendments FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delegates can create amendments" ON public.amendments;
CREATE POLICY "Delegates can create amendments"
ON public.amendments FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delegates can update own pending amendments" ON public.amendments;
CREATE POLICY "Delegates can update own pending amendments"
ON public.amendments FOR UPDATE
USING ((auth.uid() = user_id AND status = 'pending') OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete amendments" ON public.amendments;
CREATE POLICY "Only admins can delete amendments"
ON public.amendments FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 10. SELF-REFLECTIONS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.self_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  main_contribution TEXT NOT NULL DEFAULT '',
  procedure_effectiveness TEXT NOT NULL DEFAULT '',
  improvement_areas TEXT NOT NULL DEFAULT '',
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded')),
  score NUMERIC(4,2),
  feedback TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.self_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delegates can view own reflection" ON public.self_reflections;
CREATE POLICY "Delegates can view own reflection"
ON public.self_reflections FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delegates can create own reflection" ON public.self_reflections;
CREATE POLICY "Delegates can create own reflection"
ON public.self_reflections FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delegates can update own draft reflection" ON public.self_reflections;
CREATE POLICY "Delegates can update own draft reflection"
ON public.self_reflections FOR UPDATE
USING ((auth.uid() = user_id AND status = 'draft') OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete reflections" ON public.self_reflections;
CREATE POLICY "Only admins can delete reflections"
ON public.self_reflections FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 11. DELEGATE ASSESSMENTS (Rubric-based)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.delegate_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category assessment_category NOT NULL,
  auto_score rubric_level,
  manual_score rubric_level,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

ALTER TABLE public.delegate_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delegates can view own assessments" ON public.delegate_assessments;
CREATE POLICY "Delegates can view own assessments"
ON public.delegate_assessments FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can create assessments" ON public.delegate_assessments;
CREATE POLICY "Only admins can create assessments"
ON public.delegate_assessments FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update assessments" ON public.delegate_assessments;
CREATE POLICY "Only admins can update assessments"
ON public.delegate_assessments FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete assessments" ON public.delegate_assessments;
CREATE POLICY "Only admins can delete assessments"
ON public.delegate_assessments FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- 12. QUIZ RESULTS
-- ===================================================
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  config_id UUID NOT NULL REFERENCES public.quiz_configs(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delegates can view own quiz results" ON public.quiz_results;
CREATE POLICY "Delegates can view own quiz results"
ON public.quiz_results FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Delegates can create own quiz results" ON public.quiz_results;
CREATE POLICY "Delegates can create own quiz results"
ON public.quiz_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can delete quiz results" ON public.quiz_results;
CREATE POLICY "Only admins can delete quiz results"
ON public.quiz_results FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- ===================================================
-- HELPER FUNCTION: Get delegate completion status
-- ===================================================
CREATE OR REPLACE FUNCTION public.get_delegate_completion_status(delegate_user_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'opening_speech', EXISTS (
      SELECT 1 FROM speeches 
      WHERE user_id = delegate_user_id 
      AND speech_type = 'opening_speech' 
      AND status IN ('submitted', 'graded')
    ),
    'position_paper', EXISTS (
      SELECT 1 FROM position_papers 
      WHERE user_id = delegate_user_id 
      AND status IN ('submitted', 'graded')
    ),
    'resolution_amendment', EXISTS (
      SELECT 1 FROM resolutions WHERE user_id = delegate_user_id AND status IN ('submitted', 'graded', 'adopted')
    ) OR EXISTS (
      SELECT 1 FROM amendments WHERE user_id = delegate_user_id
    ) OR EXISTS (
      SELECT 1 FROM resolution_sponsors WHERE user_id = delegate_user_id
    ),
    'rules_quiz', EXISTS (
      SELECT 1 FROM quiz_results 
      WHERE user_id = delegate_user_id 
      AND passed = true
    ),
    'procedural_participation', EXISTS (
      SELECT 1 FROM procedural_actions WHERE user_id = delegate_user_id
    ) OR EXISTS (
      SELECT 1 FROM voting_records WHERE user_id = delegate_user_id
    ),
    'self_reflection', EXISTS (
      SELECT 1 FROM self_reflections 
      WHERE user_id = delegate_user_id 
      AND status IN ('submitted', 'graded')
    )
  );
$$;

-- ===================================================
-- TRIGGERS FOR UPDATED_AT
-- ===================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_delegate_profiles_updated_at ON public.delegate_profiles;
CREATE TRIGGER update_delegate_profiles_updated_at
BEFORE UPDATE ON public.delegate_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_procedural_actions_updated_at ON public.procedural_actions;
CREATE TRIGGER update_procedural_actions_updated_at
BEFORE UPDATE ON public.procedural_actions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_speeches_updated_at ON public.speeches;
CREATE TRIGGER update_speeches_updated_at
BEFORE UPDATE ON public.speeches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_position_papers_updated_at ON public.position_papers;
CREATE TRIGGER update_position_papers_updated_at
BEFORE UPDATE ON public.position_papers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_resolutions_updated_at ON public.resolutions;
CREATE TRIGGER update_resolutions_updated_at
BEFORE UPDATE ON public.resolutions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_amendments_updated_at ON public.amendments;
CREATE TRIGGER update_amendments_updated_at
BEFORE UPDATE ON public.amendments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_self_reflections_updated_at ON public.self_reflections;
CREATE TRIGGER update_self_reflections_updated_at
BEFORE UPDATE ON public.self_reflections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_delegate_assessments_updated_at ON public.delegate_assessments;
CREATE TRIGGER update_delegate_assessments_updated_at
BEFORE UPDATE ON public.delegate_assessments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();