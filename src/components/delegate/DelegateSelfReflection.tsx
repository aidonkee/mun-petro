import { useState, useEffect } from "react";
import { BookOpen, Loader2, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useSelfReflection, ReflectionStatus } from "@/hooks/useSelfReflection";

const QUESTIONS = [
  {
    id: 'main_contribution',
    question: "What was your main contribution to the committee?",
    placeholder: "Describe your key contributions, speeches, resolutions, or amendments you worked on...",
  },
  {
    id: 'procedure_effectiveness',
    question: "How effectively did you follow MUN rules and procedures?",
    placeholder: "Reflect on your procedural knowledge, proper diplomatic language, and adherence to protocol...",
  },
  {
    id: 'improvement_areas',
    question: "What would you improve next time?",
    placeholder: "Identify areas for growth and specific steps you would take to improve...",
  },
];

const MIN_WORDS_PER_QUESTION = 50;

export function DelegateSelfReflection() {
  const { reflection, loading, createOrUpdateReflection, isComplete } = useSelfReflection();
  
  const [mainContribution, setMainContribution] = useState('');
  const [procedureEffectiveness, setProcedureEffectiveness] = useState('');
  const [improvementAreas, setImprovementAreas] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (reflection) {
      setMainContribution(reflection.main_contribution);
      setProcedureEffectiveness(reflection.procedure_effectiveness);
      setImprovementAreas(reflection.improvement_areas);
      setAdditionalNotes(reflection.additional_notes || '');
    }
  }, [reflection]);

  const countWords = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

  const wordCounts = {
    main_contribution: countWords(mainContribution),
    procedure_effectiveness: countWords(procedureEffectiveness),
    improvement_areas: countWords(improvementAreas),
  };

  const allQuestionsComplete = Object.values(wordCounts).every(count => count >= MIN_WORDS_PER_QUESTION);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await createOrUpdateReflection(
        mainContribution,
        procedureEffectiveness,
        improvementAreas,
        additionalNotes || undefined,
        'draft'
      );
      toast({ title: "Draft Saved", description: "Your reflection has been saved" });
    } catch {
      toast({ title: "Error", description: "Failed to save draft", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!allQuestionsComplete) {
      toast({ 
        title: "Incomplete Reflection", 
        description: `Please write at least ${MIN_WORDS_PER_QUESTION} words for each question`, 
        variant: "destructive" 
      });
      return;
    }

    setSubmitting(true);
    try {
      await createOrUpdateReflection(
        mainContribution,
        procedureEffectiveness,
        improvementAreas,
        additionalNotes || undefined,
        'submitted'
      );
      toast({ title: "Reflection Submitted", description: "Your self-reflection has been submitted" });
    } catch {
      toast({ title: "Error", description: "Failed to submit", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = reflection?.status === 'submitted' || reflection?.status === 'graded';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="section-heading">Post-Conference Self-Reflection</h2>
        <p className="text-muted-foreground mt-1">Reflect on your performance and learning</p>
      </div>

      {/* Graded Feedback */}
      {reflection?.status === 'graded' && (
        <div className="diplomatic-card p-4 bg-success/10 border-success/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-success flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Graded
            </span>
            <span className="text-2xl font-heading font-semibold text-success">{reflection.score}/10</span>
          </div>
          {reflection.feedback && (
            <p className="text-sm text-muted-foreground">{reflection.feedback}</p>
          )}
        </div>
      )}

      {/* Mandatory Notice */}
      <div className="diplomatic-card p-4 flex items-start gap-3 bg-warning/10 border-warning/50">
        <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-warning">Mandatory Requirement</p>
          <p className="text-muted-foreground mt-1">
            This self-reflection is required to complete your conference requirements. 
            Please write at least {MIN_WORDS_PER_QUESTION} words for each question.
          </p>
        </div>
      </div>

      {/* Questions */}
      {QUESTIONS.map((q, index) => {
        const value = 
          q.id === 'main_contribution' ? mainContribution :
          q.id === 'procedure_effectiveness' ? procedureEffectiveness :
          improvementAreas;
        const setValue = 
          q.id === 'main_contribution' ? setMainContribution :
          q.id === 'procedure_effectiveness' ? setProcedureEffectiveness :
          setImprovementAreas;
        const wordCount = wordCounts[q.id as keyof typeof wordCounts];
        const meetsRequirement = wordCount >= MIN_WORDS_PER_QUESTION;

        return (
          <div key={q.id} className="diplomatic-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium">{q.question}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {meetsRequirement ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {MIN_WORDS_PER_QUESTION - wordCount} more words needed
                    </span>
                  )}
                  <span className={`text-sm font-medium ${meetsRequirement ? 'text-success' : 'text-muted-foreground'}`}>
                    {wordCount} words
                  </span>
                </div>
              </div>
            </div>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={q.placeholder}
              className="border-0 rounded-none min-h-[150px] resize-none focus-visible:ring-0"
              disabled={isSubmitted}
            />
          </div>
        );
      })}

      {/* Additional Notes */}
      <div className="diplomatic-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-muted-foreground">Additional Notes (Optional)</h3>
        </div>
        <Textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Any additional thoughts or reflections..."
          className="border-0 rounded-none min-h-[100px] resize-none focus-visible:ring-0"
          disabled={isSubmitted}
        />
      </div>

      {/* Actions */}
      <div className="diplomatic-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {allQuestionsComplete ? (
              <span className="text-success">All requirements met</span>
            ) : (
              `Complete all questions (${MIN_WORDS_PER_QUESTION}+ words each)`
            )}
          </span>
        </div>
        {!isSubmitted ? (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Draft
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !allQuestionsComplete}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Reflection
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Reflection submitted
          </span>
        )}
      </div>
    </div>
  );
}
