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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          created_at: string
          due_date: string
          id: string
          meeting_id: string
          owner_id: string
          priority: string
          rank: number
          segment_id: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          meeting_id: string
          owner_id: string
          priority: string
          rank: number
          segment_id?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          meeting_id?: string
          owner_id?: string
          priority?: string
          rank?: number
          segment_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_segment_id_meeting_id_fkey"
            columns: ["segment_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "transcript_segments"
            referencedColumns: ["id", "meeting_id"]
          },
        ]
      }
      chapters: {
        Row: {
          end_sec: number
          first_segment_id: string
          id: string
          last_segment_id: string
          meeting_id: string
          start_sec: number
          title: string
        }
        Insert: {
          end_sec: number
          first_segment_id: string
          id?: string
          last_segment_id: string
          meeting_id: string
          start_sec: number
          title: string
        }
        Update: {
          end_sec?: number
          first_segment_id?: string
          id?: string
          last_segment_id?: string
          meeting_id?: string
          start_sec?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_first_segment_id_meeting_id_fkey"
            columns: ["first_segment_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "transcript_segments"
            referencedColumns: ["id", "meeting_id"]
          },
          {
            foreignKeyName: "chapters_last_segment_id_meeting_id_fkey"
            columns: ["last_segment_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "transcript_segments"
            referencedColumns: ["id", "meeting_id"]
          },
          {
            foreignKeyName: "chapters_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          created_at: string
          id: string
          meeting_id: string
          segment_id: string | null
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_id: string
          segment_id?: string | null
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_id?: string
          segment_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_segment_id_meeting_id_fkey"
            columns: ["segment_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "transcript_segments"
            referencedColumns: ["id", "meeting_id"]
          },
        ]
      }
      insights: {
        Row: {
          id: string
          meeting_id: string
          segment_id: string
          text: string
        }
        Insert: {
          id?: string
          meeting_id: string
          segment_id: string
          text: string
        }
        Update: {
          id?: string
          meeting_id?: string
          segment_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_segment_id_meeting_id_fkey"
            columns: ["segment_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "transcript_segments"
            referencedColumns: ["id", "meeting_id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          meeting_id: string
          person_id: string
          segment_count: number
          talk_share_pct: number
        }
        Insert: {
          meeting_id: string
          person_id: string
          segment_count?: number
          talk_share_pct?: number
        }
        Update: {
          meeting_id?: string
          person_id?: string
          segment_count?: number
          talk_share_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_speakers: {
        Row: {
          label: string
          meeting_id: string
          person_id: string | null
        }
        Insert: {
          label: string
          meeting_id: string
          person_id?: string | null
        }
        Update: {
          label?: string
          meeting_id?: string
          person_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_speakers_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_speakers_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_speakers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          duration_min: number
          failure_reason: string | null
          id: string
          project_id: string
          sentiment_label: string | null
          sentiment_score: number | null
          source_file_name: string
          source_kind: string
          source_path: string | null
          status: string
          summary: string[]
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date?: string
          duration_min?: number
          failure_reason?: string | null
          id?: string
          project_id: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          source_file_name: string
          source_kind: string
          source_path?: string | null
          status?: string
          summary?: string[]
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          duration_min?: number
          failure_reason?: string | null
          id?: string
          project_id?: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          source_file_name?: string
          source_kind?: string
          source_path?: string | null
          status?: string
          summary?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          avatar_tone: string
          created_at: string
          email: string | null
          id: string
          name: string
          role: string
          user_id: string | null
        }
        Insert: {
          avatar_tone?: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string
          user_id?: string | null
        }
        Update: {
          avatar_tone?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          id: string
          meeting_id: string
          segment_id: string
          severity: string
          text: string
        }
        Insert: {
          id?: string
          meeting_id: string
          segment_id: string
          severity: string
          text: string
        }
        Update: {
          id?: string
          meeting_id?: string
          segment_id?: string
          severity?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_segment_id_meeting_id_fkey"
            columns: ["segment_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "transcript_segments"
            referencedColumns: ["id", "meeting_id"]
          },
        ]
      }
      suggested_tasks: {
        Row: {
          due_date: string
          id: string
          meeting_id: string
          owner_id: string
          priority: string
          segment_id: string
          title: string
        }
        Insert: {
          due_date: string
          id?: string
          meeting_id: string
          owner_id: string
          priority: string
          segment_id: string
          title: string
        }
        Update: {
          due_date?: string
          id?: string
          meeting_id?: string
          owner_id?: string
          priority?: string
          segment_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggested_tasks_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_tasks_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_tasks_segment_id_meeting_id_fkey"
            columns: ["segment_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "transcript_segments"
            referencedColumns: ["id", "meeting_id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      transcript_segments: {
        Row: {
          end_sec: number
          id: string
          meeting_id: string
          position: number
          sentiment: string
          speaker_label: string
          start_sec: number
          text: string
        }
        Insert: {
          end_sec: number
          id?: string
          meeting_id: string
          position: number
          sentiment?: string
          speaker_label: string
          start_sec: number
          text: string
        }
        Update: {
          end_sec?: number
          id?: string
          meeting_id?: string
          position?: number
          sentiment?: string
          speaker_label?: string
          start_sec?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcript_segments_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcript_segments_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcript_segments_meeting_id_speaker_label_fkey"
            columns: ["meeting_id", "speaker_label"]
            isOneToOne: false
            referencedRelation: "meeting_speakers"
            referencedColumns: ["meeting_id", "label"]
          },
        ]
      }
    }
    Views: {
      action_item_rows: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string | null
          meeting_id: string | null
          meeting_project_id: string | null
          meeting_team_id: string | null
          meeting_title: string | null
          owner_id: string | null
          priority: string | null
          rank: number | null
          segment_id: string | null
          status: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_segment_id_meeting_id_fkey"
            columns: ["segment_id", "meeting_id"]
            isOneToOne: false
            referencedRelation: "transcript_segments"
            referencedColumns: ["id", "meeting_id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["meeting_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["meeting_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_rows: {
        Row: {
          created_at: string | null
          date: string | null
          done_count: number | null
          duration_min: number | null
          failure_reason: string | null
          has_transcript: boolean | null
          id: string | null
          in_progress_count: number | null
          open_count: number | null
          overdue_count: number | null
          participant_ids: string[] | null
          participation: Json | null
          project_id: string | null
          sentiment_label: string | null
          sentiment_score: number | null
          source_file_name: string | null
          source_kind: string | null
          source_path: string | null
          status: string | null
          summary: string[] | null
          team_id: string | null
          title: string | null
          todo_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
