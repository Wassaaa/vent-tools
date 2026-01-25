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
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
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
 * Mock factory for success responses
 */
export function mockSuccess<T>(data: T) {
  return {
    data,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  };
}

/**
 * Mock factory for error responses
 */
export function mockError(message: string) {
  return {
    data: null,
    error: {
      message,
      name: 'Error',
      status: 400,
      __isAuthError: true,
    },
    count: null,
    status: 400,
    statusText: 'Bad Request',
  };
}

/**
 * Mock factory specifically for Auth error responses
 * Auth responses have a specific shape where data is { user: null, session: null } on error
 */
export function mockAuthError(message: string) {
  return {
    data: { user: null, session: null },
    error: {
      message,
      name: 'AuthError',
      status: 400,
      __isAuthError: true,
    },
  };
}
