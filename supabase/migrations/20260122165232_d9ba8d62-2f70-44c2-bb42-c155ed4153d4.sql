-- Create quiz_configs table
CREATE TABLE public.quiz_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL DEFAULT 'Rules of Procedure Quiz',
    description TEXT DEFAULT 'Test your knowledge of Model UN rules',
    time_limit INTEGER NOT NULL DEFAULT 30,
    passing_score INTEGER NOT NULL DEFAULT 70,
    is_active BOOLEAN NOT NULL DEFAULT false,
    allow_retakes BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.quiz_configs(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
    options JSONB NOT NULL DEFAULT '[]',
    correct_answer INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz_configs (public read, no auth for now since mock)
CREATE POLICY "Anyone can read quiz configs"
ON public.quiz_configs FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert quiz configs"
ON public.quiz_configs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update quiz configs"
ON public.quiz_configs FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete quiz configs"
ON public.quiz_configs FOR DELETE
USING (true);

-- RLS policies for quiz_questions
CREATE POLICY "Anyone can read quiz questions"
ON public.quiz_questions FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert quiz questions"
ON public.quiz_questions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update quiz questions"
ON public.quiz_questions FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete quiz questions"
ON public.quiz_questions FOR DELETE
USING (true);

-- Insert default quiz config
INSERT INTO public.quiz_configs (topic, description, time_limit, passing_score, is_active, allow_retakes)
VALUES ('Rules of Procedure Quiz', 'Test your knowledge of Model UN rules and procedures', 30, 70, true, true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_quiz_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_quiz_configs_updated_at
BEFORE UPDATE ON public.quiz_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_quiz_config_updated_at();