import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface DelegateProfile {
  id: string;
  user_id: string;
  delegate_name: string;
  country: string;
  committee: string;
  conference_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompletionStatus {
  opening_speech: boolean;
  position_paper: boolean;
  resolution_amendment: boolean;
  rules_quiz: boolean;
  procedural_participation: boolean;
  self_reflection: boolean;
}

export function useDelegateProfile() {
  const [profile, setProfile] = useState<DelegateProfile | null>(null);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("delegate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data as unknown as DelegateProfile | null);
    } catch (error) {
      console.error("Error fetching delegate profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchCompletionStatus = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("get_delegate_completion_status", {
        delegate_user_id: user.id,
      });

      if (error) throw error;
      setCompletionStatus(data as unknown as CompletionStatus);
    } catch (error) {
      console.error("Error fetching completion status:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCompletionStatus();
    } else {
      setProfile(null);
      setCompletionStatus(null);
      setLoading(false);
    }
  }, [fetchProfile, fetchCompletionStatus, user]);

  const createProfile = async (
    delegateName: string,
    country: string,
    committee: string = 'General Assembly'
  ) => {
    if (!user) throw new Error("You must be logged in");

    try {
      const { data, error } = await supabase
        .from("delegate_profiles")
        .insert({
          user_id: user.id,
          delegate_name: delegateName,
          country,
          committee,
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data as unknown as DelegateProfile);
      return data as unknown as DelegateProfile;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  };

  const updateProfile = async (
    updates: Partial<Pick<DelegateProfile, 'delegate_name' | 'country' | 'committee'>>
  ) => {
    if (!profile) throw new Error("No profile to update");

    try {
      const { error } = await supabase
        .from("delegate_profiles")
        .update(updates)
        .eq("id", profile.id);

      if (error) throw error;
      setProfile({ ...profile, ...updates });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const getCompletionPercentage = () => {
    if (!completionStatus) return 0;
    const completed = Object.values(completionStatus).filter(Boolean).length;
    return Math.round((completed / 6) * 100);
  };

  const isConferenceComplete = () => {
    if (!completionStatus) return false;
    return Object.values(completionStatus).every(Boolean);
  };

  return {
    profile,
    completionStatus,
    loading,
    fetchProfile,
    fetchCompletionStatus,
    createProfile,
    updateProfile,
    getCompletionPercentage,
    isConferenceComplete,
  };
}
