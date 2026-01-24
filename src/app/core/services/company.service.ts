import { Injectable, inject } from '@angular/core';
import type { Company, CompanyJoinRequest } from '../models/database.types';
import { SupabaseService } from './supabase.service';

/**
 * Service for company management operations
 * Handles company creation, invitation codes, and join request approvals
 */
@Injectable({ providedIn: 'root' })
export class CompanyService {
  private supabaseService = inject(SupabaseService);

  /**
   * Create a new company with auto-generated invitation code
   */
  async createCompany(
    name: string,
  ): Promise<{ success: boolean; company?: Company; error?: string }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!this.supabaseService.isManager()) {
      return { success: false, error: 'Only managers can create companies' };
    }

    try {
      const supabase = this.supabaseService.getClient();

      // Call database function to generate invitation code
      const { data: codeData, error: codeError } = await supabase.rpc(
        'generate_invitation_code',
      );

      if (codeError || !codeData) {
        console.error('Failed to generate invitation code:', codeError);
        return { success: false, error: 'Failed to generate invitation code' };
      }

      const invitationCode = codeData as string;

      // Create company with generated code
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name,
          invitation_code: invitationCode,
          created_by: userId,
        })
        .select()
        .single();

      if (companyError) {
        console.error('Company creation failed:', companyError);
        return { success: false, error: 'Failed to create company' };
      }

      // Automatically add creator as member
      const { error: memberError } = await supabase
        .from('user_companies')
        .insert({
          user_id: userId,
          company_id: company.id,
          is_active: true,
        });

      if (memberError) {
        console.error('Failed to add creator as member:', memberError);
      }

      return { success: true, company };
    } catch (error) {
      console.error('Company creation error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get all companies that the current user belongs to
   */
  async getUserCompanies(): Promise<{
    success: boolean;
    companies?: Company[];
    error?: string;
  }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch companies:', error);
        return { success: false, error: 'Failed to fetch companies' };
      }

      return { success: true, companies: data };
    } catch (error) {
      console.error('Fetch companies error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get all workers for a specific company
   */
  async getCompanyWorkers(companyId: string): Promise<{
    success: boolean;
    workers?: Array<{
      user_id: string;
      joined_at: string;
      profile: { full_name: string; role: string };
    }>;
    error?: string;
  }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId || !this.supabaseService.isManager()) {
      return { success: false, error: 'Not authorized' };
    }

    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase
        .from('user_companies')
        .select(
          `
          user_id,
          joined_at,
          profile:user_id (
            full_name,
            role
          )
        `,
        )
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (error) {
        console.error('Failed to fetch workers:', error);
        return { success: false, error: 'Failed to fetch workers' };
      }

      return { success: true, workers: data as any };
    } catch (error) {
      console.error('Fetch workers error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get pending join requests for companies managed by current user
   */
  async getPendingJoinRequests(): Promise<{
    success: boolean;
    requests?: Array<
      CompanyJoinRequest & { user_email?: string; user_name?: string }
    >;
    error?: string;
  }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId || !this.supabaseService.isManager()) {
      return { success: false, error: 'Not authorized' };
    }

    try {
      const supabase = this.supabaseService.getClient();

      // Get all join requests for companies where user is a manager
      const { data, error } = await supabase
        .from('company_join_requests')
        .select(
          `
          *,
          profiles:user_id (
            full_name
          )
        `,
        )
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch join requests:', error);
        return { success: false, error: 'Failed to fetch join requests' };
      }

      const requests = (data as any[]).map((request) => ({
        ...request,
        user_name: request.profiles?.full_name,
      }));

      return { success: true, requests };
    } catch (error) {
      console.error('Fetch join requests error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Approve a join request
   */
  async approveJoinRequest(
    requestId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId || !this.supabaseService.isManager()) {
      return { success: false, error: 'Not authorized' };
    }

    try {
      const supabase = this.supabaseService.getClient();

      // Get the request details
      const { data: request, error: fetchError } = await supabase
        .from('company_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        return { success: false, error: 'Request not found' };
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('company_join_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Failed to update request:', updateError);
        return { success: false, error: 'Failed to approve request' };
      }

      // Add user to company
      const { error: memberError } = await supabase
        .from('user_companies')
        .insert({
          user_id: request.user_id,
          company_id: request.company_id,
          is_active: true,
        });

      if (memberError) {
        console.error('Failed to add member:', memberError);
        return { success: false, error: 'Failed to add member to company' };
      }

      return { success: true };
    } catch (error) {
      console.error('Approve request error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Reject a join request
   */
  async rejectJoinRequest(
    requestId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId || !this.supabaseService.isManager()) {
      return { success: false, error: 'Not authorized' };
    }

    try {
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase
        .from('company_join_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
        })
        .eq('id', requestId);

      if (error) {
        console.error('Failed to reject request:', error);
        return { success: false, error: 'Failed to reject request' };
      }

      return { success: true };
    } catch (error) {
      console.error('Reject request error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}
