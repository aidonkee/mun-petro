import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type SpeechType = 
  | 'opening_speech'
  | 'moderated_caucus'
  | 'formal_debate'
  | 'rebuttal'
  | 'closing_statement';

export type SpeechStatus = 'draft' | 'submitted' | 'graded';

export interface Speech {
  id: string;
  user_id: string;
  speech_type: SpeechType;
  title: string | null;
  content: string;
  speaking_time_seconds: number;
  minimum_time_seconds: number;
  referenced_country: string | null;
  status: SpeechStatus;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useSpeeches() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSpeeches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("speeches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSpeeches((data as unknown as Speech[]) || []);
    } catch (error) {
      console.error("Error fetching speeches:", error);
      toast({
        title: "Error",
        description: "Failed to load speeches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSpeeches();
    } else {
      setSpeeches([]);
      setLoading(false);
    }
  }, [fetchSpeeches, user]);

  const createSpeech = async (
    speechType: SpeechType,
    content: string,
    title?: string,
    speakingTimeSeconds: number = 0,
    referencedCountry?: string,
    status: SpeechStatus = 'draft'
  ) => {
    if (!user) throw new Error("You must be logged in");

    try {
      const { data, error } = await supabase
        .from("speeches")
        .insert({
          user_id: user.id,
          speech_type: speechType,
          title,
          content,
          speaking_time_seconds: speakingTimeSeconds,
          referenced_country: referencedCountry,
          status,
          submitted_at: status === 'submitted' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      setSpeeches((prev) => [data as unknown as Speech, ...prev]);
      return data as unknown as Speech;
    } catch (error) {
      console.error("Error creating speech:", error);
      throw error;
    }
  };

  const updateSpeech = async (
    id: string,
    updates: Partial<Pick<Speech, 'content' | 'title' | 'speaking_time_seconds' | 'referenced_country' | 'status' | 'submitted_at'>>
  ) => {
    try {
      const { error } = await supabase
        .from("speeches")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setSpeeches((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    } catch (error) {
      console.error("Error updating speech:", error);
      throw error;
    }
  };

  const gradeSpeech = async (id: string, score: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from("speeches")
        .update({
          score,
          feedback,
          status: 'graded' as SpeechStatus,
          graded_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      setSpeeches((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, score, feedback, status: 'graded' as SpeechStatus, graded_at: new Date().toISOString() }
            : s
        )
      );
    } catch (error) {
      console.error("Error grading speech:", error);
      throw error;
    }
  };

  const getSpeechStats = () => {
    const byType = speeches.reduce((acc, s) => {
      acc[s.speech_type] = (acc[s.speech_type] || 0) + 1;
      return acc;
    }, {} as Record<SpeechType, number>);
    
    const totalSpeeches = speeches.length;
    const submittedSpeeches = speeches.filter(s => s.status === 'submitted' || s.status === 'graded').length;
    
    return { byType, totalSpeeches, submittedSpeeches };
  };

  return {
    speeches,
    loading,
    fetchSpeeches,
    createSpeech,
    updateSpeech,
    gradeSpeech,
    getSpeechStats,
  };
}
