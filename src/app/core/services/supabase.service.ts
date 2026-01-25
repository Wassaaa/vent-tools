import { Injectable, computed, signal, inject, InjectionToken } from '@angular/core';
import {
  SupabaseClient,
  createClient,
  type Session,
  type User,
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import type { Profile } from '../models/database.types';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('SupabaseClient');

/**
 * Supabase authentication and client service
 * Manages user auth state with Angular signals
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  // Auth state signals
  user = signal<User | null>(null);
  session = signal<Session | null>(null);
  profile = signal<Profile | null>(null);

  // Computed signals
  isAuthenticated = computed(() => this.user() !== null);
  isManager = computed(() => this.profile()?.role === 'manager');
  isWorker = computed(() => this.profile()?.role === 'worker');

  constructor() {
    this.supabase = inject(SUPABASE_CLIENT, { optional: true }) ?? createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
    );

    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);

      if (session?.user) {
        this.loadProfile();
      } else {
        this.profile.set(null);
      }
    });

    // Load initial session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
      if (session?.user) {
        this.loadProfile();
      }
    });
  }

  /**
   * Load user profile from database
   */
  private async loadProfile(): Promise<void> {
    const userId = this.user()?.id;
    if (!userId) return;

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile:', error);
      return;
    }

    this.profile.set(data);
  }

  /**
   * Sign up a new user
   */
  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: 'worker' | 'manager' = 'worker',
    invitationCode?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: authData, error: authError } =
        await this.supabase.auth.signUp({
          email,
          password,
        });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'User creation failed' };
      }

      // Create profile
      const profileData: Profile = {
        id: authData.user.id,
        full_name: fullName,
        role,
        created_at: new Date().toISOString(),
      };

      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          role,
        });

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        return { success: false, error: 'Failed to create profile' };
      }

      // Manually update signal to ensure UI reacts immediately
      this.profile.set(profileData);

      // If invitation code provided, create join request
      if (invitationCode) {
        await this.requestCompanyJoin(invitationCode);
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.user.set(null);
    this.session.set(null);
    this.profile.set(null);
  }

  /**
   * Request to join a company using invitation code
   */
  async requestCompanyJoin(
    invitationCode: string,
  ): Promise<{ success: boolean; error?: string }> {
    const userId = this.user()?.id;
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Find company by invitation code using secure RPC
      const { data: companyId, error: companyError } = await this.supabase.rpc(
        'get_company_id_by_code',
        { _code: invitationCode },
      );

      if (companyError || !companyId) {
        return { success: false, error: 'Invalid invitation code' };
      }

      // Create join request
      const { error: requestError } = await this.supabase
        .from('company_join_requests')
        .insert({
          user_id: userId,
          company_id: companyId,
          invitation_code: invitationCode,
        });

      if (requestError) {
        // Check if already requested
        if (requestError.code === '23505') {
          return { success: false, error: 'Join request already exists' };
        }
        return { success: false, error: 'Failed to create join request' };
      }

      return { success: true };
    } catch (error) {
      console.error('Join request error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get the Supabase client (for direct queries)
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
