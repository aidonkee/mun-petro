import { useState, useEffect } from "react";
import { Users, Award, ChevronRight, Loader2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  useDelegateAssessments, 
  AssessmentCategory, 
  RubricLevel, 
  CATEGORY_LABELS, 
  RUBRIC_LEVELS 
} from "@/hooks/useDelegateAssessments";
import { cn } from "@/lib/utils";

interface DelegateInfo {
  user_id: string;
  delegate_name: string;
  country: string;
  committee: string;
}

export function AdminAssessmentDashboard() {
  const [delegates, setDelegates] = useState<DelegateInfo[]>([]);
  const [selectedDelegate, setSelectedDelegate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { 
    assessments, 
    fetchAssessments, 
    upsertAssessment, 
    getAssessmentsForDelegate,
    calculateOverallScore,
    loading: assessmentsLoading,
  } = useDelegateAssessments();

  // Fetch all delegates with profiles
  useEffect(() => {
    const fetchDelegates = async () => {
      try {
        const { data, error } = await supabase
          .from("delegate_profiles")
          .select("user_id, delegate_name, country, committee")
          .order("delegate_name");

        if (error) throw error;
        setDelegates((data as DelegateInfo[]) || []);
        if (data && data.length > 0) {
          setSelectedDelegate(data[0].user_id);
        }
      } catch (error) {
        console.error("Error fetching delegates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDelegates();
  }, []);

  // Fetch assessments when delegate changes
  useEffect(() => {
    if (selectedDelegate) {
      fetchAssessments(selectedDelegate);
    }
  }, [selectedDelegate, fetchAssessments]);

  const selectedDelegateInfo = delegates.find(d => d.user_id === selectedDelegate);
  const delegateAssessments = selectedDelegate ? getAssessmentsForDelegate(selectedDelegate) : [];

  const handleScoreChange = async (category: AssessmentCategory, score: RubricLevel) => {
    if (!selectedDelegate) return;

    setSaving(true);
    try {
      await upsertAssessment(selectedDelegate, category, score);
      toast({ title: "Score Updated", description: `${CATEGORY_LABELS[category]} score saved` });
    } catch {
      toast({ title: "Error", description: "Failed to save score", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleNotesChange = async (category: AssessmentCategory, notes: string) => {
    if (!selectedDelegate) return;

    try {
      await upsertAssessment(selectedDelegate, category, undefined, undefined, notes);
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const getAssessmentForCategory = (category: AssessmentCategory) => {
    return delegateAssessments.find(a => a.category === category);
  };

  const overallScore = selectedDelegate ? calculateOverallScore(selectedDelegate) : 0;

  if (loading || assessmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (delegates.length === 0) {
    return (
      <div className="diplomatic-card p-8 text-center">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">No Delegates Found</h3>
        <p className="text-muted-foreground">Delegates will appear here once they create their profiles.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="section-heading">Assessment Dashboard</h2>
        <p className="text-muted-foreground mt-1">Evaluate delegates using the MUN rubric</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Delegate List */}
        <div className="col-span-4 diplomatic-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="subsection-heading">Delegates</h3>
            <p className="text-sm text-muted-foreground">{delegates.length} registered</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
            {delegates.map(delegate => {
              const score = calculateOverallScore(delegate.user_id);
              const isSelected = selectedDelegate === delegate.user_id;
              
              return (
                <button
                  key={delegate.user_id}
                  onClick={() => setSelectedDelegate(delegate.user_id)}
                  className={cn(
                    "w-full text-left p-4 transition-colors hover:bg-muted/50",
                    isSelected && "bg-accent"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{delegate.delegate_name}</p>
                      <p className="text-sm text-muted-foreground">{delegate.country}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {score > 0 && (
                        <span className={cn(
                          "text-sm font-medium",
                          score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-muted-foreground"
                        )}>
                          {score}%
                        </span>
                      )}
                      <ChevronRight className={cn(
                        "w-4 h-4 text-muted-foreground",
                        isSelected && "text-primary"
                      )} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Assessment Panel */}
        <div className="col-span-8 space-y-4">
          {selectedDelegateInfo && (
            <>
              {/* Delegate Header */}
              <div className="diplomatic-card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold">{selectedDelegateInfo.delegate_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDelegateInfo.country} • {selectedDelegateInfo.committee}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className={cn(
                    "text-2xl font-heading font-semibold",
                    overallScore >= 80 ? "text-success" : overallScore >= 50 ? "text-warning" : "text-muted-foreground"
                  )}>
                    {overallScore}%
                  </p>
                </div>
              </div>

              {/* Rubric Categories */}
              <div className="space-y-4">
                {(Object.keys(CATEGORY_LABELS) as AssessmentCategory[]).map(category => {
                  const assessment = getAssessmentForCategory(category);
                  const currentScore = assessment?.manual_score || assessment?.auto_score;

                  return (
                    <div key={category} className="diplomatic-card overflow-hidden">
                      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {currentScore ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                          <h4 className="font-medium">{CATEGORY_LABELS[category]}</h4>
                        </div>
                        {currentScore && (
                          <span className={cn(
                            "text-sm font-medium capitalize",
                            currentScore === 'proficient' ? "text-success" :
                            currentScore === 'developing' ? "text-warning" : "text-muted-foreground"
                          )}>
                            {currentScore}
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Score Selection */}
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">Rubric Level</label>
                          <div className="grid grid-cols-3 gap-2">
                            {RUBRIC_LEVELS.map(level => (
                              <Button
                                key={level.value}
                                variant={currentScore === level.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleScoreChange(category, level.value)}
                                disabled={saving}
                                className={cn(
                                  currentScore === level.value && (
                                    level.value === 'proficient' ? 'bg-success hover:bg-success/90' :
                                    level.value === 'developing' ? 'bg-warning hover:bg-warning/90' : ''
                                  )
                                )}
                              >
                                <span className="mr-2">{level.score}</span>
                                {level.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">Notes</label>
                          <Textarea
                            placeholder="Add assessment notes..."
                            defaultValue={assessment?.notes || ''}
                            onBlur={(e) => handleNotesChange(category, e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
