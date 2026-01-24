/**
 * Supabase database type interfaces
 * Auto-generated from database schema
 */

export interface Company {
  id: string;
  name: string;
  invitation_code: string;
  created_at: string | null;
  created_by: string | null;
}

export interface Profile {
  id: string;
  full_name: string;
  role: 'worker' | 'manager';
  created_at: string | null;
}

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  joined_at: string | null;
  is_active: boolean | null;
}

export type WorkEntryStatus =
  | 'draft'
  | 'submitted'
  | 'reviewed'
  | 'approved'
  | 'disputed';

export interface WorkEntry {
  id: string;
  user_id: string;
  company_id: string;
  entry_date: string;
  parts_data: PartData[];
  status: WorkEntryStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface EntryReview {
  id: string;
  entry_id: string;
  reviewer_id: string;
  original_parts_data: PartData[];
  reviewed_parts_data: PartData[];
  review_note: string | null;
  worker_response: string | null;
  created_at: string | null;
}

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface CompanyJoinRequest {
  id: string;
  user_id: string;
  company_id: string;
  invitation_code: string;
  status: JoinRequestStatus;
  requested_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

/**
 * Part data structure (stored in JSONB)
 * This is the structure for the parts_data arrays
 */
export interface PartData {
  partType: string;
  size: number;
  amount: number;
  conditions?: string[];
  [key: string]: any;
}
