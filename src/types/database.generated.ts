export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Rel = { foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] }
type Table<R, I = Partial<R>, U = Partial<R>> = { Row: R; Insert: I; Update: U; Relationships: Rel[] }

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" }
  public: {
    Tables: {
      admin_invites: Table<{ claimed_at: string | null; created_at: string; email: string; id: number; role: string; status: string; user_id: string | null }, { claimed_at?: string | null; created_at?: string; email: string; id?: number; role?: string; status?: string; user_id?: string | null }>
      admins: Table<{ created_at: string; role: string; user_id: string }, { created_at?: string; role?: string; user_id: string }>
      countries: Table<{ id: number; name: string }, { id?: number; name: string }>
      districts: Table<{ id: number; name: string; state_id: number }, { id?: number; name: string; state_id: number }>
      listings: Table<{
        contact_person: string | null; created_at: string | null; description: string | null; district_id: number | null; email: string | null; google_maps_url: string | null; id: number; image_url: string | null; latitude: number | null; listing_type: string; local_body_id: number | null; longitude: number | null; name: string; panchayat: string | null; phone: string | null; service_type: string | null; settlement_id: number | null; state_id: number | null; status: string | null; sub_district_id: number | null; submitter_declaration: boolean; submitter_email: string | null; submitter_name: string | null; submitter_phone: string | null; taluk: string | null; timing: string | null; village: string | null; website: string | null; whatsapp: string | null
      }, {
        contact_person?: string | null; created_at?: string | null; description?: string | null; district_id?: number | null; email?: string | null; google_maps_url?: string | null; id?: number; image_url?: string | null; latitude?: number | null; listing_type: string; local_body_id?: number | null; longitude?: number | null; name: string; panchayat?: string | null; phone?: string | null; service_type?: string | null; settlement_id?: number | null; state_id?: number | null; status?: string | null; sub_district_id?: number | null; submitter_declaration?: boolean; submitter_email?: string | null; submitter_name?: string | null; submitter_phone?: string | null; taluk?: string | null; timing?: string | null; village?: string | null; website?: string | null; whatsapp?: string | null
      }>
      local_bodies: Table<{ body_type: string; created_at: string; district_id: number | null; id: number; name: string; state_id: number | null; sub_district_id: number | null }, { body_type?: string; created_at?: string; district_id?: number | null; id?: number; name: string; state_id?: number | null; sub_district_id?: number | null }>
      settlements: Table<{ created_at: string; district_id: number | null; id: number; local_body_id: number | null; name: string; settlement_type: string; state_id: number | null; sub_district_id: number | null }, { created_at?: string; district_id?: number | null; id?: number; local_body_id?: number | null; name: string; settlement_type?: string; state_id?: number | null; sub_district_id?: number | null }>
      states: Table<{ country_id: number; id: number; name: string }, { country_id: number; id?: number; name: string }>
      sub_districts: Table<{ created_at: string; district_id: number | null; id: number; name: string; state_id: number | null }, { created_at?: string; district_id?: number | null; id?: number; name: string; state_id?: number | null }>
      volunteer_applications: Table<{ city: string; created_at: string; email: string | null; id: number; interests: string[]; message: string | null; name: string; phone: string; state: string; status: string; whatsapp: string | null }, { city: string; created_at?: string; email?: string | null; id?: number; interests?: string[]; message?: string | null; name: string; phone: string; state: string; status?: string; whatsapp?: string | null }>
    }
    Views: { [_ in never]: never }
    Functions: { claim_admin_access: { Args: never; Returns: boolean } }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals["public"]
export type Tables<N extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][N]["Row"]
export type TablesInsert<N extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][N]["Insert"]
export type TablesUpdate<N extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][N]["Update"]
export type Enums<N extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][N]
export type CompositeTypes<N extends keyof DefaultSchema["CompositeTypes"]> = DefaultSchema["CompositeTypes"][N]
export const Constants = { public: { Enums: {} } } as const
