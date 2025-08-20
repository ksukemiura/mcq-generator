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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      instruments: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      mcq_choices: {
        Row: {
          choice: string
          created_at: string
          id: string
          is_correct: boolean
          mcq_question_id: string
        }
        Insert: {
          choice: string
          created_at?: string
          id?: string
          is_correct?: boolean
          mcq_question_id?: string
        }
        Update: {
          choice?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          mcq_question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcq_choices_mcq_question_id_fkey"
            columns: ["mcq_question_id"]
            isOneToOne: false
            referencedRelation: "mcq_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_questions: {
        Row: {
          created_at: string
          id: string
          mcq_set_id: string
          question: string
        }
        Insert: {
          created_at?: string
          id?: string
          mcq_set_id?: string
          question: string
        }
        Update: {
          created_at?: string
          id?: string
          mcq_set_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcq_questions_mcq_set_id_fkey"
            columns: ["mcq_set_id"]
            isOneToOne: false
            referencedRelation: "mcq_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_session_answers: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          mcq_choice_id: string
          mcq_question_id: string
          mcq_session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          mcq_choice_id: string
          mcq_question_id: string
          mcq_session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          mcq_choice_id?: string
          mcq_question_id?: string
          mcq_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcq_session_answers_mcq_choice_id_fkey"
            columns: ["mcq_choice_id"]
            isOneToOne: false
            referencedRelation: "mcq_choices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcq_session_answers_mcq_question_id_fkey"
            columns: ["mcq_question_id"]
            isOneToOne: false
            referencedRelation: "mcq_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcq_session_answers_mcq_session_id_fkey"
            columns: ["mcq_session_id"]
            isOneToOne: false
            referencedRelation: "mcq_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_sessions: {
        Row: {
          correct_count: number | null
          created_at: string
          id: string
          mcq_set_id: string
        }
        Insert: {
          correct_count?: number | null
          created_at?: string
          id?: string
          mcq_set_id: string
        }
        Update: {
          correct_count?: number | null
          created_at?: string
          id?: string
          mcq_set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcq_sessions_mcq_set_id_fkey"
            columns: ["mcq_set_id"]
            isOneToOne: false
            referencedRelation: "mcq_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_sets: {
        Row: {
          created_at: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
