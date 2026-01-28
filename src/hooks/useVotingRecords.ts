import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type VoteOption = 'for' | 'against' | 'abstain';
export type VoteSubjectType = 'motion' | 'resolution' | 'amendment';

export interface VotingRecord {
  id: string;
  user_id: string;
  vote_subject: string;
  vote_subject_type: VoteSubjectType;
  related_resolution_id: string | null;
  vote: VoteOption;
  voted_at: string;
  created_at: string;
}

export function useVotingRecords() {
  const [votes, setVotes] = useState<VotingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchVotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("voting_records")
        .select("*")
        .order("voted_at", { ascending: false });

      if (error) throw error;
      setVotes((data as unknown as VotingRecord[]) || []);
    } catch (error) {
      console.error("Error fetching voting records:", error);
      toast({
        title: "Error",
        description: "Failed to load voting records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchVotes();
    } else {
      setVotes([]);
      setLoading(false);
    }
  }, [fetchVotes, user]);

  const castVote = async (
    voteSubject: string,
    voteSubjectType: VoteSubjectType,
    vote: VoteOption,
    relatedResolutionId?: string
  ) => {
    if (!user) throw new Error("You must be logged in");

    try {
      const { data, error } = await supabase
        .from("voting_records")
        .insert({
          user_id: user.id,
          vote_subject: voteSubject,
          vote_subject_type: voteSubjectType,
          vote,
          related_resolution_id: relatedResolutionId || null,
        })
        .select()
        .single();

      if (error) throw error;
      setVotes((prev) => [data as unknown as VotingRecord, ...prev]);
      return data as unknown as VotingRecord;
    } catch (error) {
      console.error("Error casting vote:", error);
      throw error;
    }
  };

  const getVotingStats = () => {
    const forVotes = votes.filter(v => v.vote === 'for').length;
    const againstVotes = votes.filter(v => v.vote === 'against').length;
    const abstainVotes = votes.filter(v => v.vote === 'abstain').length;
    return { forVotes, againstVotes, abstainVotes, total: votes.length };
  };

  return {
    votes,
    loading,
    fetchVotes,
    castVote,
    getVotingStats,
  };
}
