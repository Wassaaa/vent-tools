import type { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

/**
 * Creates a properly typed mock Supabase client for testing
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  } as unknown as SupabaseClient;
}

/**
 * Creates a mock query builder for table operations
 */
export function createMockQueryBuilder() {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
}

/**
 * Mock factory for simple success responses
 */
export function mockSuccess<T>(data: T) {
  return { data, error: null };
}

/**
 * Mock factory for error responses
 */
export function mockError(message: string) {
  return { data: null, error: { message } };
}
