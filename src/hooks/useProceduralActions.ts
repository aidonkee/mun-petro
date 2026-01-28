import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type MotionType = 
  | 'moderated_caucus'
  | 'unmoderated_caucus'
  | 'close_debate'
  | 'suspend_meeting'
  | 'adjourn_meeting'
  | 'introduce_draft_resolution'
  | 'divide_the_question';

export type PointType = 
  | 'point_of_order'
  | 'point_of_information'
  | 'point_of_personal_privilege'
  | 'point_of_inquiry'
  | 'right_of_reply';

export interface ProceduralAction {
  id: string;
  user_id: string;
  action_type: 'motion' | 'point';
  motion_type: MotionType | null;
  point_type: PointType | null;
  description: string | null;
  is_successful: boolean | null;
  procedure_followed: boolean | null;
  teacher_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useProceduralActions() {
  const [actions, setActions] = useState<ProceduralAction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchActions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("procedural_actions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActions((data as unknown as ProceduralAction[]) || []);
    } catch (error) {
      console.error("Error fetching procedural actions:", error);
      toast({
        title: "Error",
        description: "Failed to load procedural actions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchActions();
    } else {
      setActions([]);
      setLoading(false);
    }
  }, [fetchActions, user]);

  const createMotion = async (motionType: MotionType, description?: string) => {
    if (!user) throw new Error("You must be logged in");

    try {
      const { data, error } = await supabase
        .from("procedural_actions")
        .insert({
          user_id: user.id,
          action_type: 'motion',
          motion_type: motionType,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      setActions((prev) => [data as unknown as ProceduralAction, ...prev]);
      return data as unknown as ProceduralAction;
    } catch (error) {
      console.error("Error creating motion:", error);
      throw error;
    }
  };

  const createPoint = async (pointType: PointType, description?: string) => {
    if (!user) throw new Error("You must be logged in");

    try {
      const { data, error } = await supabase
        .from("procedural_actions")
        .insert({
          user_id: user.id,
          action_type: 'point',
          point_type: pointType,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      setActions((prev) => [data as unknown as ProceduralAction, ...prev]);
      return data as unknown as ProceduralAction;
    } catch (error) {
      console.error("Error creating point:", error);
      throw error;
    }
  };

  const updateAction = async (
    id: string,
    updates: Partial<Pick<ProceduralAction, 'is_successful' | 'procedure_followed' | 'teacher_notes'>>
  ) => {
    try {
      const { error } = await supabase
        .from("procedural_actions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
    } catch (error) {
      console.error("Error updating action:", error);
      throw error;
    }
  };

  return {
    actions,
    loading,
    fetchActions,
    createMotion,
    createPoint,
    updateAction,
  };
}
