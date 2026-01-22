import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type SubmissionType = "speech" | "position_paper" | "resolution_draft" | "amendment";
export type SubmissionStatus = "draft" | "submitted" | "graded";

export interface Submission {
  id: string;
  delegate_name: string;
  country: string;
  submission_type: SubmissionType;
  content: string;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  graded_at: string | null;
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions((data as unknown as Submission[]) || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const createSubmission = async (
    delegateName: string,
    country: string,
    submissionType: SubmissionType,
    content: string,
    status: SubmissionStatus = "draft"
  ) => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .insert({
          delegate_name: delegateName,
          country: country,
          submission_type: submissionType,
          content: content,
          status: status,
          submitted_at: status === "submitted" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setSubmissions((prev) => [data as unknown as Submission, ...prev]);
      return data as unknown as Submission;
    } catch (error) {
      console.error("Error creating submission:", error);
      throw error;
    }
  };

  const updateSubmission = async (
    id: string,
    updates: Partial<Pick<Submission, "content" | "status" | "submitted_at">>
  ) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    } catch (error) {
      console.error("Error updating submission:", error);
      throw error;
    }
  };

  const gradeSubmission = async (
    id: string,
    score: number,
    feedback: string
  ) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          score: score,
          feedback: feedback,
          status: "graded" as SubmissionStatus,
          graded_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, score, feedback, status: "graded" as SubmissionStatus, graded_at: new Date().toISOString() }
            : s
        )
      );
    } catch (error) {
      console.error("Error grading submission:", error);
      throw error;
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting submission:", error);
      throw error;
    }
  };

  return {
    submissions,
    loading,
    fetchSubmissions,
    createSubmission,
    updateSubmission,
    gradeSubmission,
    deleteSubmission,
  };
}
