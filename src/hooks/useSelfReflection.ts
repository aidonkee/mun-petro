import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type ReflectionStatus = 'draft' | 'submitted' | 'graded';

export interface SelfReflection {
  id: string;
  user_id: string;
  main_contribution: string;
  procedure_effectiveness: string;
  improvement_areas: string;
  additional_notes: string | null;
  status: ReflectionStatus;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useSelfReflection() {
  const [reflection, setReflection] = useState<SelfReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReflection = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("self_reflections")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setReflection(data as unknown as SelfReflection | null);
    } catch (error) {
      console.error("Error fetching self reflection:", error);
      toast({
        title: "Error",
        description: "Failed to load self reflection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReflection();
    } else {
      setReflection(null);
      setLoading(false);
    }
  }, [fetchReflection, user]);

  const createOrUpdateReflection = async (
    mainContribution: string,
    procedureEffectiveness: string,
    improvementAreas: string,
    additionalNotes?: string,
    status: ReflectionStatus = 'draft'
  ) => {
    if (!user) throw new Error("You must be logged in");

    try {
      if (reflection) {
        // Update existing
        const { error } = await supabase
          .from("self_reflections")
          .update({
            main_contribution: mainContribution,
            procedure_effectiveness: procedureEffectiveness,
            improvement_areas: improvementAreas,
            additional_notes: additionalNotes,
            status,
            submitted_at: status === 'submitted' ? new Date().toISOString() : reflection.submitted_at,
          })
          .eq("id", reflection.id);

        if (error) throw error;
        
        setReflection({
          ...reflection,
          main_contribution: mainContribution,
          procedure_effectiveness: procedureEffectiveness,
          improvement_areas: improvementAreas,
          additional_notes: additionalNotes || null,
          status,
          submitted_at: status === 'submitted' ? new Date().toISOString() : reflection.submitted_at,
        });
      } else {
        // Create new
        const { data, error } = await supabase
          .from("self_reflections")
          .insert({
            user_id: user.id,
            main_contribution: mainContribution,
            procedure_effectiveness: procedureEffectiveness,
            improvement_areas: improvementAreas,
            additional_notes: additionalNotes,
            status,
            submitted_at: status === 'submitted' ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;
        setReflection(data as unknown as SelfReflection);
      }
    } catch (error) {
      console.error("Error saving self reflection:", error);
      throw error;
    }
  };

  const gradeReflection = async (id: string, score: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from("self_reflections")
        .update({
          score,
          feedback,
          status: 'graded' as ReflectionStatus,
          graded_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      
      if (reflection && reflection.id === id) {
        setReflection({
          ...reflection,
          score,
          feedback,
          status: 'graded',
          graded_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error grading reflection:", error);
      throw error;
    }
  };

  const isComplete = () => {
    return reflection?.status === 'submitted' || reflection?.status === 'graded';
  };

  return {
    reflection,
    loading,
    fetchReflection,
    createOrUpdateReflection,
    gradeReflection,
    isComplete,
  };
}
