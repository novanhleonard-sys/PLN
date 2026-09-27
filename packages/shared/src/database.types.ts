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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adaptations: {
        Row: {
          age_band: Database["public"]["Enums"]["age_band"]
          audio_status: Database["public"]["Enums"]["asset_status"]
          created_at: string
          id: string
          prompt_version: string
          requested_by: string | null
          status: string
          total_pages: number
          version_id: string
        }
        Insert: {
          age_band: Database["public"]["Enums"]["age_band"]
          audio_status?: Database["public"]["Enums"]["asset_status"]
          created_at?: string
          id?: string
          prompt_version: string
          requested_by?: string | null
          status: string
          total_pages?: number
          version_id: string
        }
        Update: {
          age_band?: Database["public"]["Enums"]["age_band"]
          audio_status?: Database["public"]["Enums"]["asset_status"]
          created_at?: string
          id?: string
          prompt_version?: string
          requested_by?: string | null
          status?: string
          total_pages?: number
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adaptations_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adaptations_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "story_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      age_band_rules: {
        Row: {
          band: Database["public"]["Enums"]["age_band"]
          created_at: string
          id: string
          max_sentence_words: number
          must_keep: string
          prompt_version: string
          soften_rules: string
          vocab_note: string
        }
        Insert: {
          band: Database["public"]["Enums"]["age_band"]
          created_at?: string
          id?: string
          max_sentence_words: number
          must_keep: string
          prompt_version: string
          soften_rules: string
          vocab_note: string
        }
        Update: {
          band?: Database["public"]["Enums"]["age_band"]
          created_at?: string
          id?: string
          max_sentence_words?: number
          must_keep?: string
          prompt_version?: string
          soften_rules?: string
          vocab_note?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          cost_usd: number
          created_at: string
          id: string
          model: string
          provider: string
          ref: string | null
          stage: string
          units_in: number
          units_out: number
          user_id: string | null
        }
        Insert: {
          cost_usd?: number
          created_at?: string
          id?: string
          model: string
          provider: string
          ref?: string | null
          stage: string
          units_in?: number
          units_out?: number
          user_id?: string | null
        }
        Update: {
          cost_usd?: number
          created_at?: string
          id?: string
          model?: string
          provider?: string
          ref?: string | null
          stage?: string
          units_in?: number
          units_out?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          key: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          value: Json
        }
        Update: {
          created_at?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      characters: {
        Row: {
          aliases: string[] | null
          created_at: string
          descriptor: string
          id: string
          name: string
          ref_image_path: string | null
          scope: string
          version_id: string | null
        }
        Insert: {
          aliases?: string[] | null
          created_at?: string
          descriptor: string
          id?: string
          name: string
          ref_image_path?: string | null
          scope: string
          version_id?: string | null
        }
        Update: {
          aliases?: string[] | null
          created_at?: string
          descriptor?: string
          id?: string
          name?: string
          ref_image_path?: string | null
          scope?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "story_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      corpus_chunks: {
        Row: {
          content: string
          created_at: string
          doc_id: string
          embedding: string
          id: string
          meta: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          doc_id: string
          embedding: string
          id?: string
          meta?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          doc_id?: string
          embedding?: string
          id?: string
          meta?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "corpus_chunks_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "corpus_docs"
            referencedColumns: ["id"]
          },
        ]
      }
      corpus_docs: {
        Row: {
          created_at: string
          id: string
          license: string | null
          region_group_id: string | null
          source: string
          tale_type: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          license?: string | null
          region_group_id?: string | null
          source: string
          tale_type?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          license?: string | null
          region_group_id?: string | null
          source?: string
          tale_type?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      fallback_backgrounds: {
        Row: {
          created_at: string
          id: string
          path: string
          story_type: Database["public"]["Enums"]["story_type"] | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          story_type?: Database["public"]["Enums"]["story_type"] | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          story_type?: Database["public"]["Enums"]["story_type"] | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          attempts: number
          cost_usd: number
          created_at: string
          error: string | null
          id: string
          idempotency_key: string
          kind: string
          ref_id: string
          ref_type: string
          run_after: string
          status: Database["public"]["Enums"]["job_status"]
        }
        Insert: {
          attempts?: number
          cost_usd?: number
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key: string
          kind: string
          ref_id: string
          ref_type: string
          run_after?: string
          status?: Database["public"]["Enums"]["job_status"]
        }
        Update: {
          attempts?: number
          cost_usd?: number
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string
          kind?: string
          ref_id?: string
          ref_type?: string
          run_after?: string
          status?: Database["public"]["Enums"]["job_status"]
        }
        Relationships: []
      }
      page_audio: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          page_id: string
          path: string | null
          persona_id: string
          status: Database["public"]["Enums"]["asset_status"]
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          page_id: string
          path?: string | null
          persona_id: string
          status?: Database["public"]["Enums"]["asset_status"]
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          page_id?: string
          path?: string | null
          persona_id?: string
          status?: Database["public"]["Enums"]["asset_status"]
        }
        Relationships: [
          {
            foreignKeyName: "page_audio_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_audio_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "voice_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          adaptation_id: string
          created_at: string
          id: string
          idx: number
          scene_id: string
          text: string
        }
        Insert: {
          adaptation_id: string
          created_at?: string
          id?: string
          idx: number
          scene_id: string
          text: string
        }
        Update: {
          adaptation_id?: string
          created_at?: string
          id?: string
          idx?: number
          scene_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_adaptation_id_fkey"
            columns: ["adaptation_id"]
            isOneToOne: false
            referencedRelation: "adaptations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          preferred_map_style: string
          role: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          preferred_map_style?: string
          role?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          preferred_map_style?: string
          role?: string
        }
        Relationships: []
      }
      read_history: {
        Row: {
          adaptation_id: string
          created_at: string
          id: string
          last_page: number
          last_read_at: string
          mode: string
          story_id: string
          total_pages: number
          user_id: string
          version_id: string
        }
        Insert: {
          adaptation_id: string
          created_at?: string
          id?: string
          last_page?: number
          last_read_at?: string
          mode: string
          story_id: string
          total_pages?: number
          user_id: string
          version_id: string
        }
        Update: {
          adaptation_id?: string
          created_at?: string
          id?: string
          last_page?: number
          last_read_at?: string
          mode?: string
          story_id?: string
          total_pages?: number
          user_id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "read_history_adaptation_id_fkey"
            columns: ["adaptation_id"]
            isOneToOne: false
            referencedRelation: "adaptations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "read_history_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "read_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "read_history_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "story_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      region_groups: { Row: { id: string; slug: string; name: string; created_at: string; }; Insert: { id?: string; slug: string; name: string; created_at?: string; }; Update: { id?: string; slug?: string; name?: string; created_at?: string; }; Relationships: []; }; regions: {
        Row: {
          aliases: string[] | null
          bbox: Json | null
          code: string
          created_at: string
          id: string
          lat: number
          level: string
          lng: number
          name: string
          parent_id: string | null
          region_group_id: string | null
        }
        Insert: {
          aliases?: string[] | null
          bbox?: Json | null
          code: string
          created_at?: string
          id?: string
          lat: number
          level: string
          lng: number
          name: string
          parent_id?: string | null
          region_group_id?: string | null
        }
        Update: {
          aliases?: string[] | null
          bbox?: Json | null
          code?: string
          created_at?: string
          id?: string
          lat?: number
          level?: string
          lng?: number
          name?: string
          parent_id?: string | null
          region_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          status: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          status?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          status?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_stories: {
        Row: {
          saved_at: string
          story_id: string
          user_id: string
        }
        Insert: {
          saved_at?: string
          story_id: string
          user_id: string
        }
        Update: {
          saved_at?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scenes: {
        Row: {
          character_ids: string[] | null
          created_at: string
          description: string
          id: string
          idx: number
          image_path: string | null
          image_prompt: string | null
          image_status: Database["public"]["Enums"]["asset_status"]
          version_id: string
        }
        Insert: {
          character_ids?: string[] | null
          created_at?: string
          description: string
          id?: string
          idx: number
          image_path?: string | null
          image_prompt?: string | null
          image_status?: Database["public"]["Enums"]["asset_status"]
          version_id: string
        }
        Update: {
          character_ids?: string[] | null
          created_at?: string
          description?: string
          id?: string
          idx?: number
          image_path?: string | null
          image_prompt?: string | null
          image_status?: Database["public"]["Enums"]["asset_status"]
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenes_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "story_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string
          id: string
          lat: number
          lng: number
          region_id: string | null
          sensitivity: number
          slug: string
          status: Database["public"]["Enums"]["version_status"]
          synopsis: string | null
          themes: string[] | null
          tier: number
          tier_locked: boolean
          title: string
          type: Database["public"]["Enums"]["story_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          lat: number
          lng: number
          region_id?: string | null
          sensitivity?: number
          slug: string
          status?: Database["public"]["Enums"]["version_status"]
          synopsis?: string | null
          themes?: string[] | null
          tier?: number
          tier_locked?: boolean
          title: string
          type: Database["public"]["Enums"]["story_type"]
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          region_id?: string | null
          sensitivity?: number
          slug?: string
          status?: Database["public"]["Enums"]["version_status"]
          synopsis?: string | null
          themes?: string[] | null
          tier?: number
          tier_locked?: boolean
          title?: string
          type?: Database["public"]["Enums"]["story_type"]
        }
        Relationships: [
          {
            foreignKeyName: "stories_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      story_stats: {
        Row: {
          created_at: string
          reads_count: number
          saves_count: number
          score: number
          story_id: string
        }
        Insert: {
          created_at?: string
          reads_count?: number
          saves_count?: number
          score?: number
          story_id: string
        }
        Update: {
          created_at?: string
          reads_count?: number
          saves_count?: number
          score?: number
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_stats_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: true
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_versions: {
        Row: {
          asset_status: Database["public"]["Enums"]["asset_status"]
          body: string
          contributor_id: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string
          language: string
          license: string
          sources: Json
          status: Database["public"]["Enums"]["version_status"]
          story_id: string
        }
        Insert: {
          asset_status?: Database["public"]["Enums"]["asset_status"]
          body: string
          contributor_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label: string
          language?: string
          license?: string
          sources: Json
          status?: Database["public"]["Enums"]["version_status"]
          story_id: string
        }
        Update: {
          asset_status?: Database["public"]["Enums"]["asset_status"]
          body?: string
          contributor_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          language?: string
          license?: string
          sources?: Json
          status?: Database["public"]["Enums"]["version_status"]
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_versions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_versions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      style_configs: {
        Row: {
          anchor_image_path: string | null
          created_at: string
          descriptor: string
          id: string
          negative_prompt: string
          palette: Json
          region_group_id: string | null
          story_type: Database["public"]["Enums"]["story_type"]
        }
        Insert: {
          anchor_image_path?: string | null
          created_at?: string
          descriptor: string
          id?: string
          negative_prompt: string
          palette: Json
          region_group_id?: string | null
          story_type: Database["public"]["Enums"]["story_type"]
        }
        Update: {
          anchor_image_path?: string | null
          created_at?: string
          descriptor?: string
          id?: string
          negative_prompt?: string
          palette?: Json
          region_group_id?: string | null
          story_type?: Database["public"]["Enums"]["story_type"]
        }
        Relationships: []
      }
      submissions: {
        Row: {
          admin_note: string | null
          body: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          region_id: string | null
          reject_reason: string | null
          rights_declared: boolean
          sources: Json
          status: Database["public"]["Enums"]["submission_status"]
          target_story_id: string | null
          title: string
          type: Database["public"]["Enums"]["story_type"]
          user_id: string
          version_id: string | null
          version_label: string
        }
        Insert: {
          admin_note?: string | null
          body: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          region_id?: string | null
          reject_reason?: string | null
          rights_declared?: boolean
          sources: Json
          status?: Database["public"]["Enums"]["submission_status"]
          target_story_id?: string | null
          title: string
          type: Database["public"]["Enums"]["story_type"]
          user_id: string
          version_id?: string | null
          version_label: string
        }
        Update: {
          admin_note?: string | null
          body?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          region_id?: string | null
          reject_reason?: string | null
          rights_declared?: boolean
          sources?: Json
          status?: Database["public"]["Enums"]["submission_status"]
          target_story_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["story_type"]
          user_id?: string
          version_id?: string | null
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_target_story_id_fkey"
            columns: ["target_story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "story_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_runs: {
        Row: {
          confidence: number
          cost_usd: number
          created_at: string
          id: string
          matched_sources: Json | null
          model: string
          output: Json
          provider: string
          stage: string
          submission_id: string
          verdict: string
        }
        Insert: {
          confidence: number
          cost_usd?: number
          created_at?: string
          id?: string
          matched_sources?: Json | null
          model: string
          output: Json
          provider: string
          stage: string
          submission_id: string
          verdict: string
        }
        Update: {
          confidence?: number
          cost_usd?: number
          created_at?: string
          id?: string
          matched_sources?: Json | null
          model?: string
          output?: Json
          provider?: string
          stage?: string
          submission_id?: string
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_runs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_personas: {
        Row: {
          created_at: string
          id: string
          name: string
          region_group_id: string | null
          sample_path: string | null
          story_type: Database["public"]["Enums"]["story_type"] | null
          style_prompt: string
          voice_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          region_group_id?: string | null
          sample_path?: string | null
          story_type?: Database["public"]["Enums"]["story_type"] | null
          style_prompt: string
          voice_name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          region_group_id?: string | null
          sample_path?: string | null
          story_type?: Database["public"]["Enums"]["story_type"] | null
          style_prompt?: string
          voice_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_job: {
        Args: { p_kinds: string[]; p_limit?: number }
        Returns: {
          attempts: number
          cost_usd: number
          created_at: string
          error: string | null
          id: string
          idempotency_key: string
          kind: string
          ref_id: string
          ref_type: string
          run_after: string
          status: Database["public"]["Enums"]["job_status"]
        }[]
        SetofOptions: {
          from: "*"
          to: "jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      free_page_limit: { Args: { p_adaptation_id: string }; Returns: number }
    }
    Enums: {
      age_band: "asli" | "3-4" | "5-6" | "7-9" | "10-12"
      asset_status: "none" | "generating" | "ready" | "partial" | "failed"
      job_status: "queued" | "running" | "succeeded" | "failed" | "deferred"
      
      story_type: "legenda" | "mite" | "fabel" | "dongeng"
      submission_status:
        | "submitted"
        | "triaging"
        | "verifying"
        | "needs_review"
        | "approved"
        | "rejected"
      version_status: "processing" | "published" | "unpublished"
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
    Enums: {
      age_band: ["asli", "3-4", "5-6", "7-9", "10-12"],
      asset_status: ["none", "generating", "ready", "partial", "failed"],
      job_status: ["queued", "running", "succeeded", "failed", "deferred"],
      
      story_type: ["legenda", "mite", "fabel", "dongeng"],
      submission_status: [
        "submitted",
        "triaging",
        "verifying",
        "needs_review",
        "approved",
        "rejected",
      ],
      version_status: ["processing", "published", "unpublished"],
    },
  },
} as const


