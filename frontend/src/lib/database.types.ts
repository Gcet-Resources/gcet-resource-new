// Generated from the versioned schema by scripts/generate-database-types.mjs.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Database = { public: { Tables: {
  access_requests: {
    Row: {
      id: string;
      user_id: string;
      requested_role: string;
      club_id: string | null;
      reason: string;
      status: string;
      reviewer_id: string | null;
      reviewed_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      requested_role: string;
      club_id?: string | null;
      reason: string;
      status?: string;
      reviewer_id?: string | null;
      reviewed_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      requested_role?: string;
      club_id?: string | null;
      reason?: string;
      status?: string;
      reviewer_id?: string | null;
      reviewed_at?: string | null;
      created_at?: string;
    };
    Relationships: [];
  };
  audit_events: {
    Row: {
      id: string;
      actor_id: string | null;
      action: string;
      target_id: string;
      details: Json;
      created_at: string;
    };
    Insert: {
      id?: string;
      actor_id?: string | null;
      action: string;
      target_id: string;
      details?: Json;
      created_at?: string;
    };
    Update: {
      id?: string;
      actor_id?: string | null;
      action?: string;
      target_id?: string;
      details?: Json;
      created_at?: string;
    };
    Relationships: [];
  };
  club_follows: {
    Row: {
      user_id: string;
      club_id: string;
      created_at: string;
    };
    Insert: {
      user_id: string;
      club_id: string;
      created_at?: string;
    };
    Update: {
      user_id?: string;
      club_id?: string;
      created_at?: string;
    };
    Relationships: [];
  };
  clubs: {
    Row: {
      id: string;
      slug: string;
      name: string;
      description: string;
      active: boolean;
    };
    Insert: {
      id?: string;
      slug: string;
      name: string;
      description?: string;
      active?: boolean;
    };
    Update: {
      id?: string;
      slug?: string;
      name?: string;
      description?: string;
      active?: boolean;
    };
    Relationships: [];
  };
  courses: {
    Row: {
      id: string;
      code: string;
      name: string;
      department: string;
      active: boolean;
    };
    Insert: {
      id?: string;
      code: string;
      name: string;
      department?: string;
      active?: boolean;
    };
    Update: {
      id?: string;
      code?: string;
      name?: string;
      department?: string;
      active?: boolean;
    };
    Relationships: [];
  };
  exam_events: {
    Row: {
      id: string;
      title: string;
      description: string;
      course_id: string | null;
      academic_year: number | null;
      starts_at: string;
      ends_at: string;
      status: string;
      created_by: string | null;
    };
    Insert: {
      id?: string;
      title: string;
      description?: string;
      course_id?: string | null;
      academic_year?: number | null;
      starts_at: string;
      ends_at: string;
      status?: string;
      created_by?: string | null;
    };
    Update: {
      id?: string;
      title?: string;
      description?: string;
      course_id?: string | null;
      academic_year?: number | null;
      starts_at?: string;
      ends_at?: string;
      status?: string;
      created_by?: string | null;
    };
    Relationships: [];
  };
  favorites: {
    Row: {
      user_id: string;
      subject_id: string;
      created_at: string;
    };
    Insert: {
      user_id: string;
      subject_id: string;
      created_at?: string;
    };
    Update: {
      user_id?: string;
      subject_id?: string;
      created_at?: string;
    };
    Relationships: [];
  };
  import_quarantine: {
    Row: {
      id: string;
      source_key: string;
      reason: string;
      payload: Json;
      created_at: string;
    };
    Insert: {
      id: string;
      source_key: string;
      reason: string;
      payload: Json;
      created_at?: string;
    };
    Update: {
      id?: string;
      source_key?: string;
      reason?: string;
      payload?: Json;
      created_at?: string;
    };
    Relationships: [];
  };
  memberships: {
    Row: {
      user_id: string;
      status: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      user_id: string;
      status?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      user_id?: string;
      status?: string;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  notice_bookmarks: {
    Row: {
      user_id: string;
      notice_id: string;
      created_at: string;
    };
    Insert: {
      user_id: string;
      notice_id: string;
      created_at?: string;
    };
    Update: {
      user_id?: string;
      notice_id?: string;
      created_at?: string;
    };
    Relationships: [];
  };
  notice_reads: {
    Row: {
      user_id: string;
      notice_id: string;
      read_at: string;
    };
    Insert: {
      user_id: string;
      notice_id: string;
      read_at?: string;
    };
    Update: {
      user_id?: string;
      notice_id?: string;
      read_at?: string;
    };
    Relationships: [];
  };
  notices: {
    Row: {
      id: string;
      title: string;
      body: string;
      category: string;
      scope: string;
      course_id: string | null;
      club_id: string | null;
      academic_year: number | null;
      status: string;
      important: boolean;
      published_at: string;
      expires_at: string | null;
      created_by: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      title: string;
      body: string;
      category?: string;
      scope?: string;
      course_id?: string | null;
      club_id?: string | null;
      academic_year?: number | null;
      status?: string;
      important?: boolean;
      published_at?: string;
      expires_at?: string | null;
      created_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      title?: string;
      body?: string;
      category?: string;
      scope?: string;
      course_id?: string | null;
      club_id?: string | null;
      academic_year?: number | null;
      status?: string;
      important?: boolean;
      published_at?: string;
      expires_at?: string | null;
      created_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  profiles: {
    Row: {
      id: string;
      display_name: string;
      course_id: string | null;
      academic_year: number | null;
      semester: number | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id: string;
      display_name: string;
      course_id?: string | null;
      academic_year?: number | null;
      semester?: number | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      display_name?: string;
      course_id?: string | null;
      academic_year?: number | null;
      semester?: number | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  reports: {
    Row: {
      id: string;
      user_id: string;
      resource_id: string | null;
      subject: string;
      message: string;
      status: string;
      created_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      resource_id?: string | null;
      subject: string;
      message: string;
      status?: string;
      created_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      resource_id?: string | null;
      subject?: string;
      message?: string;
      status?: string;
      created_at?: string;
    };
    Relationships: [];
  };
  resources: {
    Row: {
      id: string;
      subject_id: string;
      resource_type: string;
      legacy_id: string | null;
      title: string;
      description: string;
      source_url: string | null;
      storage_path: string | null;
      provider: string;
      status: string;
      sort_order: number;
      created_by: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      subject_id: string;
      resource_type: string;
      legacy_id?: string | null;
      title: string;
      description?: string;
      source_url?: string | null;
      storage_path?: string | null;
      provider?: string;
      status?: string;
      sort_order?: number;
      created_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      subject_id?: string;
      resource_type?: string;
      legacy_id?: string | null;
      title?: string;
      description?: string;
      source_url?: string | null;
      storage_path?: string | null;
      provider?: string;
      status?: string;
      sort_order?: number;
      created_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  role_assignments: {
    Row: {
      id: string;
      user_id: string;
      role: string;
      club_id: string | null;
      created_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      role: string;
      club_id?: string | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      role?: string;
      club_id?: string | null;
      created_at?: string;
    };
    Relationships: [];
  };
  subjects: {
    Row: {
      id: string;
      legacy_code: string;
      year: string;
      title: string;
      description: string;
      color: string;
      bg_color: string;
      course_id: string | null;
    };
    Insert: {
      id?: string;
      legacy_code: string;
      year: string;
      title: string;
      description?: string;
      color?: string;
      bg_color?: string;
      course_id?: string | null;
    };
    Update: {
      id?: string;
      legacy_code?: string;
      year?: string;
      title?: string;
      description?: string;
      color?: string;
      bg_color?: string;
      course_id?: string | null;
    };
    Relationships: [];
  };
}; Views: Record<string, never>; Functions: {
  complete_onboarding: { Args: { p_display_name: string; p_course_id?: string | null; p_academic_year?: number | null; p_semester?: number | null }; Returns: Database['public']['Tables']['profiles']['Row'] };
  admin_assign_role: { Args: { p_user_id: string; p_role: string; p_club_id?: string | null }; Returns: undefined };
  admin_revoke_role: { Args: { p_assignment_id: string }; Returns: undefined };
  admin_set_membership: { Args: { p_user_id: string; p_status: string }; Returns: undefined };
  review_access_request: { Args: { p_request_id: string; p_approve: boolean }; Returns: undefined };
  admin_list_users: { Args: { p_limit?: number; p_offset?: number; p_search?: string | null }; Returns: { id: string; email: string; display_name: string | null; course_id: string | null; academic_year: number | null; semester: number | null; status: string | null; roles: Json }[] };
  admin_list_access_requests: { Args: { p_status?: string | null; p_limit?: number; p_offset?: number }; Returns: (Database['public']['Tables']['access_requests']['Row'] & { email: string; display_name: string | null })[] };
  prepare_admin_account_action: { Args: { p_action: string; p_user_id?: string | null; p_email?: string | null }; Returns: string };
}; Enums: Record<string, never>; CompositeTypes: Record<string, never>; } };
