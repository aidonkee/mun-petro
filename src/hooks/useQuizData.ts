import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface QuizConfig {
  id: string;
  topic: string;
  description: string | null;
  time_limit: number;
  passing_score: number;
  is_active: boolean;
  allow_retakes: boolean;
}

export interface QuizQuestion {
  id: string;
  config_id: string;
  question: string;
  question_type: "multiple_choice" | "true_false";
  options: string[];
  correct_answer: number;
  explanation: string | null;
  order_index: number;
}

interface DbQuizConfig {
  id: string;
  topic: string;
  description: string | null;
  time_limit: number;
  passing_score: number;
  is_active: boolean;
  allow_retakes: boolean;
  created_at: string;
  updated_at: string;
}

interface DbQuizQuestion {
  id: string;
  config_id: string;
  question: string;
  question_type: string;
  options: unknown;
  correct_answer: number;
  explanation: string | null;
  order_index: number;
  created_at: string;
}

export function useQuizData() {
  const { toast } = useToast();
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizData = useCallback(async () => {
    try {
      // Fetch config using raw query
      const { data: configData, error: configError } = await supabase
        .from("quiz_configs" as never)
        .select("*")
        .limit(1)
        .single();

      if (configError && configError.code !== "PGRST116") {
        throw configError;
      }

      if (configData) {
        const typedConfig = configData as unknown as DbQuizConfig;
        setConfig({
          id: typedConfig.id,
          topic: typedConfig.topic,
          description: typedConfig.description,
          time_limit: typedConfig.time_limit,
          passing_score: typedConfig.passing_score,
          is_active: typedConfig.is_active,
          allow_retakes: typedConfig.allow_retakes,
        });

        // Fetch questions for this config
        const { data: questionsData, error: questionsError } = await supabase
          .from("quiz_questions" as never)
          .select("*")
          .eq("config_id" as never, typedConfig.id as never)
          .order("order_index" as never, { ascending: true });

        if (questionsError) throw questionsError;

        const typedQuestions = (questionsData as unknown as DbQuizQuestion[]) || [];
        const parsedQuestions: QuizQuestion[] = typedQuestions.map((q) => ({
          id: q.id,
          config_id: q.config_id,
          question: q.question,
          question_type: q.question_type as "multiple_choice" | "true_false",
          options: Array.isArray(q.options) ? (q.options as string[]) : JSON.parse(q.options as string),
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          order_index: q.order_index,
        }));

        setQuestions(parsedQuestions);
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  const updateConfig = async (updates: Partial<QuizConfig>) => {
    if (!config) return;

    try {
      const { error } = await supabase
        .from("quiz_configs" as never)
        .update(updates as never)
        .eq("id" as never, config.id as never);

      if (error) throw error;

      setConfig({ ...config, ...updates });
      toast({ title: "Success", description: "Quiz settings saved" });
    } catch (error) {
      console.error("Error updating config:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const addQuestion = async (question: Omit<QuizQuestion, "id" | "config_id" | "order_index">) => {
    if (!config) return;

    try {
      const insertData = {
        config_id: config.id,
        question: question.question,
        question_type: question.question_type,
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        order_index: questions.length,
      };

      const { data, error } = await supabase
        .from("quiz_questions" as never)
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;

      const typedData = data as unknown as DbQuizQuestion;
      const newQuestion: QuizQuestion = {
        id: typedData.id,
        config_id: typedData.config_id,
        question: typedData.question,
        question_type: typedData.question_type as "multiple_choice" | "true_false",
        options: Array.isArray(typedData.options) ? (typedData.options as string[]) : JSON.parse(typedData.options as string),
        correct_answer: typedData.correct_answer,
        explanation: typedData.explanation,
        order_index: typedData.order_index,
      };

      setQuestions([...questions, newQuestion]);
      toast({ title: "Success", description: "Question added" });
      return newQuestion;
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const updateQuestion = async (id: string, updates: Partial<QuizQuestion>) => {
    try {
      const { error } = await supabase
        .from("quiz_questions" as never)
        .update(updates as never)
        .eq("id" as never, id as never);

      if (error) throw error;

      setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
      toast({ title: "Success", description: "Question updated" });
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from("quiz_questions" as never)
        .delete()
        .eq("id" as never, id as never);

      if (error) throw error;

      setQuestions(questions.filter((q) => q.id !== id));
      toast({ title: "Deleted", description: "Question removed" });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  return {
    config,
    questions,
    loading,
    updateConfig,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    refetch: fetchQuizData,
  };
}
