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
      ai_calls_log: {
        Row: {
          cost: number | null
          created_at: string | null
          error_message: string | null
          id: string
          model: string | null
          prompt_type: string | null
          provider: string | null
          retry_count: number | null
          status: string | null
          tenant_id: string
          tokens_used: number | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          model?: string | null
          prompt_type?: string | null
          provider?: string | null
          retry_count?: number | null
          status?: string | null
          tenant_id: string
          tokens_used?: number | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          model?: string | null
          prompt_type?: string | null
          provider?: string | null
          retry_count?: number | null
          status?: string | null
          tenant_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_calls_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          insight_type: string | null
          restaurant_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          insight_type?: string | null
          restaurant_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          insight_type?: string | null
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          active: boolean | null
          city: string | null
          created_at: string | null
          id: string
          last_triggered_at: string | null
          max_bedrooms: number | null
          max_price: number | null
          min_bedrooms: number | null
          min_price: number | null
          name: string
          property_type: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          city?: string | null
          created_at?: string | null
          id?: string
          last_triggered_at?: string | null
          max_bedrooms?: number | null
          max_price?: number | null
          min_bedrooms?: number | null
          min_price?: number | null
          name: string
          property_type?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          city?: string | null
          created_at?: string | null
          id?: string
          last_triggered_at?: string | null
          max_bedrooms?: number | null
          max_price?: number | null
          min_bedrooms?: number | null
          min_price?: number | null
          name?: string
          property_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          restaurant_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          restaurant_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      development_phases: {
        Row: {
          budget: number | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          opportunity_id: string
          phase_order: number | null
          progress: number | null
          start_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          opportunity_id: string
          phase_order?: number | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          opportunity_id?: string
          phase_order?: number | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_phases_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          error_details: Json | null
          id: string
          import_type: string
          rows_failed: number | null
          rows_total: number | null
          started_at: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          import_type: string
          rows_failed?: number | null
          rows_total?: number | null
          started_at?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          import_type?: string
          rows_failed?: number | null
          rows_total?: number | null
          started_at?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          created_at: string | null
          id: string
          min_threshold: number | null
          name: string
          restaurant_id: string
          stock_level: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          min_threshold?: number | null
          name: string
          restaurant_id: string
          stock_level?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          min_threshold?: number | null
          name?: string
          restaurant_id?: string
          stock_level?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          min_threshold: number | null
          name: string
          restaurant_id: string
          status: string | null
          stock_level: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          min_threshold?: number | null
          name: string
          restaurant_id: string
          status?: string | null
          stock_level?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          min_threshold?: number | null
          name?: string
          restaurant_id?: string
          status?: string | null
          stock_level?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agent_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          property_id: string | null
          source: string | null
          stage: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          offer_id: string | null
          property_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          offer_id?: string | null
          property_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          offer_id?: string | null
          property_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          asking_price: number | null
          buyer_id: string
          closing_timeline_days: number | null
          counter_price: number | null
          created_at: string | null
          currency: string | null
          deposit_percent: number | null
          financing_type: string | null
          id: string
          message: string | null
          offer_price: number
          offer_type: string | null
          proof_uploaded: boolean | null
          property_id: string
          seller_id: string | null
          seller_note: string | null
          seriousness_score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          asking_price?: number | null
          buyer_id: string
          closing_timeline_days?: number | null
          counter_price?: number | null
          created_at?: string | null
          currency?: string | null
          deposit_percent?: number | null
          financing_type?: string | null
          id?: string
          message?: string | null
          offer_price: number
          offer_type?: string | null
          proof_uploaded?: boolean | null
          property_id: string
          seller_id?: string | null
          seller_note?: string | null
          seriousness_score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          asking_price?: number | null
          buyer_id?: string
          closing_timeline_days?: number | null
          counter_price?: number | null
          created_at?: string | null
          currency?: string | null
          deposit_percent?: number | null
          financing_type?: string | null
          id?: string
          message?: string | null
          offer_price?: number
          offer_type?: string | null
          proof_uploaded?: boolean | null
          property_id?: string
          seller_id?: string | null
          seller_note?: string | null
          seriousness_score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          address: string | null
          ai_analysis: Json | null
          bathrooms: number | null
          bedrooms: number | null
          built_area: number | null
          city: string | null
          country: string | null
          created_at: string
          currency: string | null
          description: string | null
          entry_price: number
          estimated_dev_cost: number | null
          expected_revenue: number | null
          floors: number | null
          id: string
          investment_score: number | null
          investment_type: string
          land_area: number | null
          legal_status: string | null
          location: Json | null
          permit_status: string | null
          property_type: string
          risk_level: string | null
          status: string | null
          tags: string[] | null
          timeline_months: number | null
          title: string
          updated_at: string
          user_id: string
          zoning: string | null
        }
        Insert: {
          address?: string | null
          ai_analysis?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          entry_price?: number
          estimated_dev_cost?: number | null
          expected_revenue?: number | null
          floors?: number | null
          id?: string
          investment_score?: number | null
          investment_type?: string
          land_area?: number | null
          legal_status?: string | null
          location?: Json | null
          permit_status?: string | null
          property_type?: string
          risk_level?: string | null
          status?: string | null
          tags?: string[] | null
          timeline_months?: number | null
          title: string
          updated_at?: string
          user_id: string
          zoning?: string | null
        }
        Update: {
          address?: string | null
          ai_analysis?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          entry_price?: number
          estimated_dev_cost?: number | null
          expected_revenue?: number | null
          floors?: number | null
          id?: string
          investment_score?: number | null
          investment_type?: string
          land_area?: number | null
          legal_status?: string | null
          location?: Json | null
          permit_status?: string | null
          property_type?: string
          risk_level?: string | null
          status?: string | null
          tags?: string[] | null
          timeline_months?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          zoning?: string | null
        }
        Relationships: []
      }
      platform_admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          reason: string
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          reason: string
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          reason?: string
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      platform_feature_flags: {
        Row: {
          created_at: string | null
          default_enabled: boolean | null
          description: string | null
          key: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_enabled?: boolean | null
          description?: string | null
          key: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_enabled?: boolean | null
          description?: string | null
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_notifications: {
        Row: {
          body: string
          channel: string | null
          created_at: string | null
          created_by: string | null
          id: string
          sent_at: string | null
          status: string | null
          target_activity_days: number | null
          target_city: string | null
          target_plan: string | null
          title: string
        }
        Insert: {
          body: string
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          target_activity_days?: number | null
          target_city?: string | null
          target_plan?: string | null
          title: string
        }
        Update: {
          body?: string
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          target_activity_days?: number | null
          target_city?: string | null
          target_plan?: string | null
          title?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_plans: {
        Row: {
          created_at: string
          id: string
          land_area: number
          land_location: Json
          max_floors: number | null
          restrictions: string[] | null
          result: Json | null
          shape: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          land_area: number
          land_location: Json
          max_floors?: number | null
          restrictions?: string[] | null
          result?: Json | null
          shape?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          land_area?: number
          land_location?: Json
          max_floors?: number | null
          restrictions?: string[] | null
          result?: Json | null
          shape?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          template_key: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          template_key: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          template_key?: string
          version?: number
        }
        Relationships: []
      }
      properties: {
        Row: {
          agent_name: string | null
          agent_verified: boolean | null
          ai_confidence: string | null
          ai_valuation: number | null
          area: number
          bathrooms: number | null
          bedrooms: number | null
          city: string
          created_at: string | null
          currency: string | null
          description: string | null
          description_ar: string | null
          district: string | null
          features: string[] | null
          id: string
          latitude: number | null
          longitude: number | null
          price: number
          price_iqd: number | null
          property_type: string
          status: string | null
          terra_score: number | null
          title: string
          title_ar: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
          views: number | null
        }
        Insert: {
          agent_name?: string | null
          agent_verified?: boolean | null
          ai_confidence?: string | null
          ai_valuation?: number | null
          area: number
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          district?: string | null
          features?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          price: number
          price_iqd?: number | null
          property_type: string
          status?: string | null
          terra_score?: number | null
          title: string
          title_ar?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          views?: number | null
        }
        Update: {
          agent_name?: string | null
          agent_verified?: boolean | null
          ai_confidence?: string | null
          ai_valuation?: number | null
          area?: number
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          district?: string | null
          features?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          price?: number
          price_iqd?: number | null
          property_type?: string
          status?: string | null
          terra_score?: number | null
          title?: string
          title_ar?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          views?: number | null
        }
        Relationships: []
      }
      property_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          id: string
          property_id: string
          storage_path: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          file_name: string
          id?: string
          property_id: string
          storage_path: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          id?: string
          property_id?: string
          storage_path?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string | null
          id: string
          property_id: string | null
          sort_order: number | null
          storage_path: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          sort_order?: number | null
          storage_path: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          sort_order?: number | null
          storage_path?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string | null
          created_at: string | null
          food_cost: number | null
          id: string
          name: string
          restaurant_id: string
          selling_price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          food_cost?: number | null
          id?: string
          name: string
          restaurant_id: string
          selling_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          food_cost?: number | null
          id?: string
          name?: string
          restaurant_id?: string
          selling_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_users: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_users_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          cuisine_type: string | null
          currency: string | null
          id: string
          language: string | null
          logo_url: string | null
          name: string
          owner_user_id: string | null
          plan: string
          status: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          currency?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name: string
          owner_user_id?: string | null
          plan?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          currency?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name?: string
          owner_user_id?: string | null
          plan?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_rows: {
        Row: {
          created_at: string | null
          id: string
          item_name: string | null
          quantity: number | null
          restaurant_id: string
          revenue: number | null
          sale_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_name?: string | null
          quantity?: number | null
          restaurant_id: string
          revenue?: number | null
          sale_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_name?: string | null
          quantity?: number | null
          restaurant_id?: string
          revenue?: number | null
          sale_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_rows_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_verifications: {
        Row: {
          created_at: string
          document_url: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          status: string
          storage_path: string | null
          updated_at: string
          user_id: string
          verification_type: string
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id: string
          verification_type?: string
        }
        Update: {
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          product_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          product_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          product_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tenant_feature_flags: {
        Row: {
          created_at: string | null
          enabled: boolean
          flag_key: string
          id: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          enabled: boolean
          flag_key: string
          id?: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean
          flag_key?: string
          id?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_feature_flags_flag_key_fkey"
            columns: ["flag_key"]
            isOneToOne: false
            referencedRelation: "platform_feature_flags"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "tenant_feature_flags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_limits: {
        Row: {
          ai_quota_monthly: number | null
          custom_overrides: Json | null
          id: string
          ingredients_limit: number | null
          inventory_limit: number | null
          plan: string
          recipes_limit: number | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ai_quota_monthly?: number | null
          custom_overrides?: Json | null
          id?: string
          ingredients_limit?: number | null
          inventory_limit?: number | null
          plan?: string
          recipes_limit?: number | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ai_quota_monthly?: number | null
          custom_overrides?: Json | null
          id?: string
          ingredients_limit?: number | null
          inventory_limit?: number | null
          plan?: string
          recipes_limit?: number | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_limits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          called_at: string | null
          function_name: string
          id: string
          user_id: string
        }
        Insert: {
          called_at?: string | null
          function_name: string
          id?: string
          user_id: string
        }
        Update: {
          called_at?: string | null
          function_name?: string
          id?: string
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_property_views: {
        Args: { p_property_id: string }
        Returns: undefined
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "buyer" | "seller" | "admin" | "developer"
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
      app_role: ["buyer", "seller", "admin", "developer"],
    },
  },
} as const
