
-- Storage buckets for GPPR
INSERT INTO storage.buckets (id, name, public) VALUES ('gppr-criteria', 'gppr-criteria', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gppr-works', 'gppr-works', false) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Admins can manage gppr criteria files"
ON storage.objects FOR ALL
USING (bucket_id = 'gppr-criteria' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'gppr-criteria' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage gppr work files"
ON storage.objects FOR ALL
USING (bucket_id = 'gppr-works' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'gppr-works' AND has_role(auth.uid(), 'admin'::app_role));

-- GPPR assessment sessions
CREATE TABLE public.gppr_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  title TEXT NOT NULL,
  unit_or_term TEXT,
  criteria_file_path TEXT,
  criteria_text TEXT,
  criteria_summary TEXT,
  status TEXT NOT NULL DEFAULT 'criteria_pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gppr_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage gppr sessions"
ON public.gppr_sessions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- GPPR student works
CREATE TABLE public.gppr_student_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.gppr_sessions(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  file_path TEXT,
  file_name TEXT,
  file_type TEXT,
  ai_score TEXT,
  ai_feedback TEXT,
  ai_criteria_scores JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gppr_student_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage gppr works"
ON public.gppr_student_works FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_gppr_sessions_updated_at
BEFORE UPDATE ON public.gppr_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gppr_works_updated_at
BEFORE UPDATE ON public.gppr_student_works
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
