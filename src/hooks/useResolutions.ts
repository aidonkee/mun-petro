import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type ResolutionStatus = 'draft' | 'submitted' | 'graded' | 'adopted' | 'failed';
export type SponsorRole = 'main_sponsor' | 'co_sponsor' | 'signatory';
export type AmendmentType = 'friendly' | 'unfriendly';
export type AmendmentStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Clause {
  id: string;
  type: 'preambulatory' | 'operative';
  phrase: string;
  content: string;
}

export interface Resolution {
  id: string;
  user_id: string;
  topic: string;
  committee: string | null;
  clauses: Clause[];
  status: ResolutionStatus;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  presented: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResolutionSponsor {
  id: string;
  resolution_id: string;
  user_id: string;
  role: SponsorRole;
  created_at: string;
}

export interface Amendment {
  id: string;
  resolution_id: string;
  user_id: string;
  amendment_type: AmendmentType;
  clause_index: number;
  original_text: string | null;
  proposed_text: string;
  rationale: string | null;
  status: AmendmentStatus;
  created_at: string;
  updated_at: string;
}

export function useResolutions() {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [sponsors, setSponsors] = useState<ResolutionSponsor[]>([]);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchResolutions = useCallback(async () => {
    try {
      const [resData, sponsorData, amendmentData] = await Promise.all([
        supabase.from("resolutions").select("*").order("created_at", { ascending: false }),
        supabase.from("resolution_sponsors").select("*"),
        supabase.from("amendments").select("*").order("created_at", { ascending: false }),
      ]);

      if (resData.error) throw resData.error;
      if (sponsorData.error) throw sponsorData.error;
      if (amendmentData.error) throw amendmentData.error;

      const parsedResolutions = (resData.data || []).map(res => ({
        ...res,
        clauses: typeof res.clauses === 'string' ? JSON.parse(res.clauses) : res.clauses || [],
      }));

      setResolutions(parsedResolutions as unknown as Resolution[]);
      setSponsors((sponsorData.data as unknown as ResolutionSponsor[]) || []);
      setAmendments((amendmentData.data as unknown as Amendment[]) || []);
    } catch (error) {
      console.error("Error fetching resolutions:", error);
      toast({
        title: "Error",
        description: "Failed to load resolutions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchResolutions();
    } else {
      setResolutions([]);
      setSponsors([]);
      setAmendments([]);
      setLoading(false);
    }
  }, [fetchResolutions, user]);

  const createResolution = async (
    topic: string,
    clauses: Clause[] = [],
    committee?: string,
    status: ResolutionStatus = 'draft'
  ) => {
    if (!user) throw new Error("You must be logged in");

    try {
      const insertData = {
        user_id: user.id,
        topic,
        clauses: JSON.stringify(clauses),
        committee,
        status,
        submitted_at: status === 'submitted' ? new Date().toISOString() : null,
      };
      
      const { data, error } = await supabase
        .from("resolutions")
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;

      const parsedRes = {
        ...data,
        clauses: typeof data.clauses === 'string' ? JSON.parse(data.clauses) : data.clauses || [],
      };

      setResolutions((prev) => [parsedRes as unknown as Resolution, ...prev]);
      return parsedRes as unknown as Resolution;
    } catch (error) {
      console.error("Error creating resolution:", error);
      throw error;
    }
  };

  const updateResolution = async (
    id: string,
    updates: Partial<Pick<Resolution, 'topic' | 'clauses' | 'committee' | 'status' | 'submitted_at' | 'presented'>>
  ) => {
    try {
      const dbUpdates: Record<string, unknown> = { ...updates };
      if (updates.clauses) {
        dbUpdates.clauses = JSON.stringify(updates.clauses);
      }
      
      const { error } = await supabase
        .from("resolutions")
        .update(dbUpdates as never)
        .eq("id", id);

      if (error) throw error;
      setResolutions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    } catch (error) {
      console.error("Error updating resolution:", error);
      throw error;
    }
  };

  const addSponsor = async (resolutionId: string, role: SponsorRole) => {
    if (!user) throw new Error("You must be logged in");

    try {
      const { data, error } = await supabase
        .from("resolution_sponsors")
        .insert({
          resolution_id: resolutionId,
          user_id: user.id,
          role,
        })
        .select()
        .single();

      if (error) throw error;
      setSponsors((prev) => [...prev, data as unknown as ResolutionSponsor]);
      return data as unknown as ResolutionSponsor;
    } catch (error) {
      console.error("Error adding sponsor:", error);
      throw error;
    }
  };

  const createAmendment = async (
    resolutionId: string,
    amendmentType: AmendmentType,
    clauseIndex: number,
    proposedText: string,
    originalText?: string,
    rationale?: string
  ) => {
    if (!user) throw new Error("You must be logged in");

    try {
      const { data, error } = await supabase
        .from("amendments")
        .insert({
          resolution_id: resolutionId,
          user_id: user.id,
          amendment_type: amendmentType,
          clause_index: clauseIndex,
          original_text: originalText,
          proposed_text: proposedText,
          rationale,
        })
        .select()
        .single();

      if (error) throw error;
      setAmendments((prev) => [data as unknown as Amendment, ...prev]);
      return data as unknown as Amendment;
    } catch (error) {
      console.error("Error creating amendment:", error);
      throw error;
    }
  };

  const updateAmendment = async (
    id: string,
    updates: Partial<Pick<Amendment, 'proposed_text' | 'rationale' | 'status'>>
  ) => {
    try {
      const { error } = await supabase
        .from("amendments")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setAmendments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
    } catch (error) {
      console.error("Error updating amendment:", error);
      throw error;
    }
  };

  const getResolutionSponsors = (resolutionId: string) => {
    return sponsors.filter(s => s.resolution_id === resolutionId);
  };

  const getResolutionAmendments = (resolutionId: string) => {
    return amendments.filter(a => a.resolution_id === resolutionId);
  };

  return {
    resolutions,
    sponsors,
    amendments,
    loading,
    fetchResolutions,
    createResolution,
    updateResolution,
    addSponsor,
    createAmendment,
    updateAmendment,
    getResolutionSponsors,
    getResolutionAmendments,
  };
}
