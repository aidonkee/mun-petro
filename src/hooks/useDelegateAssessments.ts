import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type AssessmentCategory = 
  | 'procedural_knowledge'
  | 'engagement_discussion'
  | 'resolution_work'
  | 'academic_quality'
  | 'self_reflection';

export type RubricLevel = 'beginning' | 'developing' | 'proficient';

export interface DelegateAssessment {
  id: string;
  user_id: string;
  category: AssessmentCategory;
  auto_score: RubricLevel | null;
  manual_score: RubricLevel | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_LABELS: Record<AssessmentCategory, string> = {
  procedural_knowledge: 'Procedural Knowledge',
  engagement_discussion: 'Engagement in Discussion',
  resolution_work: 'Work on Resolution',
  academic_quality: 'Academic Quality',
  self_reflection: 'Self-Reflection',
};

export const RUBRIC_LEVELS: { value: RubricLevel; label: string; score: number }[] = [
  { value: 'beginning', label: 'Beginning', score: 1 },
  { value: 'developing', label: 'Developing', score: 2 },
  { value: 'proficient', label: 'Proficient', score: 3 },
];

export function useDelegateAssessments() {
  const [assessments, setAssessments] = useState<DelegateAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();

  const fetchAssessments = useCallback(async (delegateUserId?: string) => {
    try {
      let query = supabase.from("delegate_assessments").select("*");
      
      if (delegateUserId) {
        query = query.eq("user_id", delegateUserId);
      }

      const { data, error } = await query.order("category");

      if (error) throw error;
      setAssessments((data as unknown as DelegateAssessment[]) || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast({
        title: "Error",
        description: "Failed to load assessments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (role === 'admin') {
        // Admin sees all assessments
        fetchAssessments();
      } else {
        // Delegate sees own assessments
        fetchAssessments(user.id);
      }
    } else {
      setAssessments([]);
      setLoading(false);
    }
  }, [fetchAssessments, user, role]);

  const upsertAssessment = async (
    delegateUserId: string,
    category: AssessmentCategory,
    manualScore?: RubricLevel,
    autoScore?: RubricLevel,
    notes?: string
  ) => {
    try {
      const existing = assessments.find(
        a => a.user_id === delegateUserId && a.category === category
      );

      if (existing) {
        // Update
        const updates: Partial<DelegateAssessment> = {};
        if (manualScore !== undefined) updates.manual_score = manualScore;
        if (autoScore !== undefined) updates.auto_score = autoScore;
        if (notes !== undefined) updates.notes = notes;

        const { error } = await supabase
          .from("delegate_assessments")
          .update(updates)
          .eq("id", existing.id);

        if (error) throw error;
        
        setAssessments(prev =>
          prev.map(a => a.id === existing.id ? { ...a, ...updates } : a)
        );
      } else {
        // Insert
        const { data, error } = await supabase
          .from("delegate_assessments")
          .insert({
            user_id: delegateUserId,
            category,
            manual_score: manualScore,
            auto_score: autoScore,
            notes,
          })
          .select()
          .single();

        if (error) throw error;
        setAssessments(prev => [...prev, data as unknown as DelegateAssessment]);
      }
    } catch (error) {
      console.error("Error upserting assessment:", error);
      throw error;
    }
  };

  const getAssessmentsForDelegate = (delegateUserId: string) => {
    return assessments.filter(a => a.user_id === delegateUserId);
  };

  const getFinalScore = (assessment: DelegateAssessment): RubricLevel | null => {
    return assessment.manual_score || assessment.auto_score;
  };

  const calculateOverallScore = (delegateUserId: string): number => {
    const delegateAssessments = getAssessmentsForDelegate(delegateUserId);
    if (delegateAssessments.length === 0) return 0;

    const totalScore = delegateAssessments.reduce((sum, a) => {
      const finalScore = getFinalScore(a);
      if (!finalScore) return sum;
      const level = RUBRIC_LEVELS.find(r => r.value === finalScore);
      return sum + (level?.score || 0);
    }, 0);

    return Math.round((totalScore / (delegateAssessments.length * 3)) * 100);
  };

  return {
    assessments,
    loading,
    fetchAssessments,
    upsertAssessment,
    getAssessmentsForDelegate,
    getFinalScore,
    calculateOverallScore,
  };
}
