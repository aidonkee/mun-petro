export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      amendments: {
        Row: {
          amendment_type: Database["public"]["Enums"]["amendment_type"]
          clause_index: number
          created_at: string
          id: string
          original_text: string | null
          proposed_text: string
          rationale: string | null
          resolution_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amendment_type: Database["public"]["Enums"]["amendment_type"]
          clause_index: number
          created_at?: string
          id?: string
          original_text?: string | null
          proposed_text: string
          rationale?: string | null
          resolution_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amendment_type?: Database["public"]["Enums"]["amendment_type"]
          clause_index?: number
          created_at?: string
          id?: string
          original_text?: string | null
          proposed_text?: string
          rationale?: string | null
          resolution_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "amendments_resolution_id_fkey"
            columns: ["resolution_id"]
            isOneToOne: false
            referencedRelation: "resolutions"
            referencedColumns: ["id"]
          },
        ]
      }
      delegate_assessments: {
        Row: {
          auto_score: Database["public"]["Enums"]["rubric_level"] | null
          category: Database["public"]["Enums"]["assessment_category"]
          created_at: string
          id: string
          manual_score: Database["public"]["Enums"]["rubric_level"] | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_score?: Database["public"]["Enums"]["rubric_level"] | null
          category: Database["public"]["Enums"]["assessment_category"]
          created_at?: string
          id?: string
          manual_score?: Database["public"]["Enums"]["rubric_level"] | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_score?: Database["public"]["Enums"]["rubric_level"] | null
          category?: Database["public"]["Enums"]["assessment_category"]
          created_at?: string
          id?: string
          manual_score?: Database["public"]["Enums"]["rubric_level"] | null
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      delegate_profiles: {
        Row: {
          committee: string
          conference_completed: boolean
          country: string
          created_at: string
          delegate_name: string
          id: string
          login_email: string | null
          login_password: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          committee?: string
          conference_completed?: boolean
          country: string
          created_at?: string
          delegate_name: string
          id?: string
          login_email?: string | null
          login_password?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          committee?: string
          conference_completed?: boolean
          country?: string
          created_at?: string
          delegate_name?: string
          id?: string
          login_email?: string | null
          login_password?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      position_papers: {
        Row: {
          alternative_viewpoints_section: string
          background_section: string
          country_position_section: string
          created_at: string
          feedback: string | null
          graded_at: string | null
          id: string
          proposed_solutions_section: string
          score: number | null
          sources: Json
          status: string
          submitted_at: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alternative_viewpoints_section?: string
          background_section?: string
          country_position_section?: string
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          proposed_solutions_section?: string
          score?: number | null
          sources?: Json
          status?: string
          submitted_at?: string | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alternative_viewpoints_section?: string
          background_section?: string
          country_position_section?: string
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          proposed_solutions_section?: string
          score?: number | null
          sources?: Json
          status?: string
          submitted_at?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      procedural_actions: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          is_successful: boolean | null
          motion_type: Database["public"]["Enums"]["motion_type"] | null
          point_type: Database["public"]["Enums"]["point_type"] | null
          procedure_followed: boolean | null
          teacher_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_successful?: boolean | null
          motion_type?: Database["public"]["Enums"]["motion_type"] | null
          point_type?: Database["public"]["Enums"]["point_type"] | null
          procedure_followed?: boolean | null
          teacher_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_successful?: boolean | null
          motion_type?: Database["public"]["Enums"]["motion_type"] | null
          point_type?: Database["public"]["Enums"]["point_type"] | null
          procedure_followed?: boolean | null
          teacher_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_configs: {
        Row: {
          allow_retakes: boolean
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          passing_score: number
          time_limit: number
          topic: string
          updated_at: string
        }
        Insert: {
          allow_retakes?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          passing_score?: number
          time_limit?: number
          topic?: string
          updated_at?: string
        }
        Update: {
          allow_retakes?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          passing_score?: number
          time_limit?: number
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          config_id: string
          correct_answer: number
          created_at: string
          explanation: string | null
          id: string
          options: Json
          order_index: number
          question: string
          question_type: string
        }
        Insert: {
          config_id: string
          correct_answer?: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number
          question: string
          question_type?: string
        }
        Update: {
          config_id?: string
          correct_answer?: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number
          question?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "quiz_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          answers: Json
          completed_at: string
          config_id: string
          created_at: string
          id: string
          passed: boolean
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          config_id: string
          created_at?: string
          id?: string
          passed: boolean
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          config_id?: string
          created_at?: string
          id?: string
          passed?: boolean
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "quiz_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      resolution_sponsors: {
        Row: {
          created_at: string
          id: string
          resolution_id: string
          role: Database["public"]["Enums"]["sponsor_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resolution_id: string
          role: Database["public"]["Enums"]["sponsor_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resolution_id?: string
          role?: Database["public"]["Enums"]["sponsor_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolution_sponsors_resolution_id_fkey"
            columns: ["resolution_id"]
            isOneToOne: false
            referencedRelation: "resolutions"
            referencedColumns: ["id"]
          },
        ]
      }
      resolutions: {
        Row: {
          clauses: Json
          committee: string | null
          created_at: string
          feedback: string | null
          graded_at: string | null
          id: string
          presented: boolean
          score: number | null
          status: string
          submitted_at: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clauses?: Json
          committee?: string | null
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          presented?: boolean
          score?: number | null
          status?: string
          submitted_at?: string | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clauses?: Json
          committee?: string | null
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          presented?: boolean
          score?: number | null
          status?: string
          submitted_at?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      self_reflections: {
        Row: {
          additional_notes: string | null
          created_at: string
          feedback: string | null
          graded_at: string | null
          id: string
          improvement_areas: string
          main_contribution: string
          procedure_effectiveness: string
          score: number | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          improvement_areas?: string
          main_contribution?: string
          procedure_effectiveness?: string
          score?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          improvement_areas?: string
          main_contribution?: string
          procedure_effectiveness?: string
          score?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      speeches: {
        Row: {
          content: string
          created_at: string
          feedback: string | null
          graded_at: string | null
          id: string
          minimum_time_seconds: number
          referenced_country: string | null
          score: number | null
          speaking_time_seconds: number
          speech_type: Database["public"]["Enums"]["speech_type"]
          status: string
          submitted_at: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          minimum_time_seconds?: number
          referenced_country?: string | null
          score?: number | null
          speaking_time_seconds?: number
          speech_type?: Database["public"]["Enums"]["speech_type"]
          status?: string
          submitted_at?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          minimum_time_seconds?: number
          referenced_country?: string | null
          score?: number | null
          speaking_time_seconds?: number
          speech_type?: Database["public"]["Enums"]["speech_type"]
          status?: string
          submitted_at?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          content: string
          country: string
          created_at: string
          delegate_name: string
          feedback: string | null
          graded_at: string | null
          id: string
          score: number | null
          status: Database["public"]["Enums"]["submission_status"]
          submission_type: Database["public"]["Enums"]["submission_type"]
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          country: string
          created_at?: string
          delegate_name: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_type?: Database["public"]["Enums"]["submission_type"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          country?: string
          created_at?: string
          delegate_name?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_type?: Database["public"]["Enums"]["submission_type"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voting_records: {
        Row: {
          created_at: string
          id: string
          related_resolution_id: string | null
          user_id: string
          vote: Database["public"]["Enums"]["vote_option"]
          vote_subject: string
          vote_subject_type: string
          voted_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          related_resolution_id?: string | null
          user_id: string
          vote: Database["public"]["Enums"]["vote_option"]
          vote_subject: string
          vote_subject_type: string
          voted_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          related_resolution_id?: string | null
          user_id?: string
          vote?: Database["public"]["Enums"]["vote_option"]
          vote_subject?: string
          vote_subject_type?: string
          voted_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      quiz_questions_public: {
        Row: {
          config_id: string | null
          created_at: string | null
          explanation: string | null
          id: string | null
          options: Json | null
          order_index: number | null
          question: string | null
          question_type: string | null
        }
        Insert: {
          config_id?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          options?: Json | null
          order_index?: number | null
          question?: string | null
          question_type?: string | null
        }
        Update: {
          config_id?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string | null
          options?: Json | null
          order_index?: number | null
          question?: string | null
          question_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "quiz_configs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_quiz_answer: {
        Args: { question_id: string; selected_answer: number }
        Returns: boolean
      }
      get_delegate_completion_status: {
        Args: { delegate_user_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      amendment_type: "friendly" | "unfriendly"
      app_role: "admin" | "delegate"
      assessment_category:
        | "procedural_knowledge"
        | "engagement_discussion"
        | "resolution_work"
        | "academic_quality"
        | "self_reflection"
      motion_type:
        | "moderated_caucus"
        | "unmoderated_caucus"
        | "close_debate"
        | "suspend_meeting"
        | "adjourn_meeting"
        | "introduce_draft_resolution"
        | "divide_the_question"
      point_type:
        | "point_of_order"
        | "point_of_information"
        | "point_of_personal_privilege"
        | "point_of_inquiry"
        | "right_of_reply"
      rubric_level: "beginning" | "developing" | "proficient"
      speech_type:
        | "opening_speech"
        | "moderated_caucus"
        | "formal_debate"
        | "rebuttal"
        | "closing_statement"
      sponsor_role: "main_sponsor" | "co_sponsor" | "signatory"
      submission_status: "draft" | "submitted" | "graded"
      submission_type:
        | "speech"
        | "position_paper"
        | "resolution_draft"
        | "amendment"
      vote_option: "for" | "against" | "abstain"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      amendment_type: ["friendly", "unfriendly"],
      app_role: ["admin", "delegate"],
      assessment_category: [
        "procedural_knowledge",
        "engagement_discussion",
        "resolution_work",
        "academic_quality",
        "self_reflection",
      ],
      motion_type: [
        "moderated_caucus",
        "unmoderated_caucus",
        "close_debate",
        "suspend_meeting",
        "adjourn_meeting",
        "introduce_draft_resolution",
        "divide_the_question",
      ],
      point_type: [
        "point_of_order",
        "point_of_information",
        "point_of_personal_privilege",
        "point_of_inquiry",
        "right_of_reply",
      ],
      rubric_level: ["beginning", "developing", "proficient"],
      speech_type: [
        "opening_speech",
        "moderated_caucus",
        "formal_debate",
        "rebuttal",
        "closing_statement",
      ],
      sponsor_role: ["main_sponsor", "co_sponsor", "signatory"],
      submission_status: ["draft", "submitted", "graded"],
      submission_type: [
        "speech",
        "position_paper",
        "resolution_draft",
        "amendment",
      ],
      vote_option: ["for", "against", "abstain"],
    },
  },
} as const
