import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type PaperStatus = 'draft' | 'submitted' | 'graded';

export interface Source {
  title: string;
  url?: string;
  author?: string;
  date?: string;
}

export interface PositionPaper {
  id: string;
  user_id: string;
  topic: string;
  background_section: string;
  country_position_section: string;
  alternative_viewpoints_section: string;
  proposed_solutions_section: string;
  sources: Source[];
  status: PaperStatus;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
}

export function usePositionPapers() {
  const [papers, setPapers] = useState<PositionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPapers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("position_papers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse sources from JSON
      const parsedData = (data || []).map(paper => ({
        ...paper,
        sources: typeof paper.sources === 'string' ? JSON.parse(paper.sources) : paper.sources || [],
      }));
      
      setPapers(parsedData as unknown as PositionPaper[]);
    } catch (error) {
      console.error("Error fetching position papers:", error);
      toast({
        title: "Error",
        description: "Failed to load position papers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPapers();
    } else {
      setPapers([]);
      setLoading(false);
    }
  }, [fetchPapers, user]);

  const createPaper = async (
    topic: string,
    backgroundSection: string = '',
    countryPositionSection: string = '',
    alternativeViewpointsSection: string = '',
    proposedSolutionsSection: string = '',
    sources: Source[] = [],
    status: PaperStatus = 'draft'
  ) => {
    if (!user) throw new Error("You must be logged in");

    try {
      const insertData = {
        user_id: user.id,
        topic,
        background_section: backgroundSection,
        country_position_section: countryPositionSection,
        alternative_viewpoints_section: alternativeViewpointsSection,
        proposed_solutions_section: proposedSolutionsSection,
        sources: JSON.stringify(sources),
        status,
        submitted_at: status === 'submitted' ? new Date().toISOString() : null,
      };
      
      const { data, error } = await supabase
        .from("position_papers")
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      
      const parsedData = {
        ...data,
        sources: typeof data.sources === 'string' ? JSON.parse(data.sources) : data.sources || [],
      };
      
      setPapers((prev) => [parsedData as unknown as PositionPaper, ...prev]);
      return parsedData as unknown as PositionPaper;
    } catch (error) {
      console.error("Error creating position paper:", error);
      throw error;
    }
  };

  const updatePaper = async (
    id: string,
    updates: Partial<Pick<PositionPaper, 'topic' | 'background_section' | 'country_position_section' | 'alternative_viewpoints_section' | 'proposed_solutions_section' | 'sources' | 'status' | 'submitted_at'>>
  ) => {
    try {
      const dbUpdates: Record<string, unknown> = { ...updates };
      if (updates.sources) {
        dbUpdates.sources = JSON.stringify(updates.sources);
      }
      
      const { error } = await supabase
        .from("position_papers")
        .update(dbUpdates as never)
        .eq("id", id);

      if (error) throw error;
      setPapers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    } catch (error) {
      console.error("Error updating position paper:", error);
      throw error;
    }
  };

  const gradePaper = async (id: string, score: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from("position_papers")
        .update({
          score,
          feedback,
          status: 'graded' as PaperStatus,
          graded_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      setPapers((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, score, feedback, status: 'graded' as PaperStatus, graded_at: new Date().toISOString() }
            : p
        )
      );
    } catch (error) {
      console.error("Error grading position paper:", error);
      throw error;
    }
  };

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return {
    papers,
    loading,
    fetchPapers,
    createPaper,
    updatePaper,
    gradePaper,
    countWords,
  };
}
