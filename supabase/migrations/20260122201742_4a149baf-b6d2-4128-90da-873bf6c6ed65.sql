-- Create enum for submission types
CREATE TYPE public.submission_type AS ENUM ('speech', 'position_paper', 'resolution_draft', 'amendment');

-- Create enum for submission status
CREATE TYPE public.submission_status AS ENUM ('draft', 'submitted', 'graded');

-- Create submissions table for delegate speeches and papers
CREATE TABLE public.submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    delegate_name TEXT NOT NULL,
    country TEXT NOT NULL,
    submission_type submission_type NOT NULL DEFAULT 'speech',
    content TEXT NOT NULL,
    status submission_status NOT NULL DEFAULT 'draft',
    score DECIMAL(3,1) CHECK (score >= 0 AND score <= 10),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (no auth yet)
CREATE POLICY "Anyone can read submissions" 
ON public.submissions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert submissions" 
ON public.submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update submissions" 
ON public.submissions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete submissions" 
ON public.submissions 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_quiz_config_updated_at();

-- Insert sample submissions data
INSERT INTO public.submissions (delegate_name, country, submission_type, content, status, submitted_at)
VALUES 
    ('Alexandra Chen', 'France', 'position_paper', 
     'The French Republic firmly believes that the current crisis in the Sahel region demands immediate and coordinated international action. As a permanent member of the United Nations Security Council and a nation with deep historical ties to the region, France is uniquely positioned to contribute to a comprehensive solution.

The delegation of France proposes a three-pillar approach:

First, we must address the immediate humanitarian concerns. The displacement of over 2.5 million people across the region requires urgent attention. France commits to increasing its humanitarian aid by 40% and calls upon fellow member states to match this commitment.

Second, the security situation cannot be ignored. The proliferation of armed groups threatens not only regional stability but also international peace. France supports the expansion of MINUSMA''s mandate and offers additional training support for regional forces.

Third, and most critically, we must address the root causes of instability. Economic development, educational opportunities, and good governance are essential for lasting peace. France proposes the establishment of a UN Development Fund specifically targeted at the Sahel region.

The French delegation stands ready to work with all parties to achieve these objectives and restore peace and prosperity to this vital region.', 
     'submitted', now()),
    ('Marcus Williams', 'United States', 'resolution_draft', 
     'The United States of America approaches this matter with the gravity it deserves. As the largest contributor to UN peacekeeping operations, we understand the complexities of maintaining international peace and security...', 
     'graded', now() - interval '5 hours'),
    ('Sofia Rodriguez', 'Brazil', 'position_paper', 
     'Brazil, as the largest nation in South America and a key player in the Global South, brings a unique perspective to this discussion...', 
     'submitted', now() - interval '1 day'),
    ('James Kim', 'Republic of Korea', 'amendment', 
     'The Republic of Korea proposes the following amendments to the working paper currently before this committee...', 
     'graded', now() - interval '1 day');

-- Update graded submissions with scores
UPDATE public.submissions SET score = 8.5, feedback = 'Excellent resolution draft with clear structure and comprehensive analysis.', graded_at = now() WHERE delegate_name = 'Marcus Williams';
UPDATE public.submissions SET score = 9.0, feedback = 'Outstanding amendment proposal. Well-researched and diplomatically sound.', graded_at = now() WHERE delegate_name = 'James Kim';