import { TestBed } from '@angular/core/testing';
import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from './supabase.service';
import {
  createMockSupabaseClient,
  mockError,
  mockSuccess,
} from './test-utils/supabase-mock';

// Mock Supabase createClient
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => createMockSupabaseClient()),
}));

describe('SupabaseService', () => {
  let service: SupabaseService;
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseService);
    mockClient = service.getClient() as any;
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication State', () => {
    it('should initialize with null user', () => {
      expect(service.user()).toBeNull();
    });

    it('should initialize with null session', () => {
      expect(service.session()).toBeNull();
    });

    it('should have isAuthenticated as false initially', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should have isManager as false initially', () => {
      expect(service.isManager()).toBe(false);
    });

    it('should have isWorker as false initially', () => {
      expect(service.isWorker()).toBe(false);
    });
  });

  describe('signUp', () => {
    it('should create a new user account', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      vi.mocked(mockClient.auth.signUp).mockResolvedValue(
        mockSuccess({ user: mockUser, session: null }),
      );

      vi.mocked(mockClient.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue(mockSuccess(null)),
      } as any);

      const result = await service.signUp(
        'test@example.com',
        'password123',
        'Test User',
        'worker',
      );

      expect(result.success).toBe(true);
      expect(mockClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle signup errors', async () => {
      vi.mocked(mockClient.auth.signUp).mockResolvedValue(
        mockError('Email already exists'),
      );

      const result = await service.signUp(
        'test@example.com',
        'password123',
        'Test User',
        'worker',
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });

    it('should create profile after signup', async () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      vi.mocked(mockClient.auth.signUp).mockResolvedValue(
        mockSuccess({ user: mockUser, session: null }),
      );

      const mockInsert = vi.fn().mockResolvedValue(mockSuccess(null));
      vi.mocked(mockClient.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      await service.signUp(
        'test@example.com',
        'password123',
        'Test User',
        'manager',
      );

      expect(mockInsert).toHaveBeenCalledWith({
        id: 'test-user-id',
        full_name: 'Test User',
        role: 'manager',
      });
    });
  });

  describe('signIn', () => {
    it('should sign in an existing user', async () => {
      vi.mocked(mockClient.auth.signInWithPassword).mockResolvedValue(
        mockSuccess({ user: { id: 'test-user-id' }, session: {} }),
      );

      const result = await service.signIn('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login errors', async () => {
      vi.mocked(mockClient.auth.signInWithPassword).mockResolvedValue(
        mockError('Invalid credentials'),
      );

      const result = await service.signIn('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('should sign out the current user', async () => {
      vi.mocked(mockClient.auth.signOut).mockResolvedValue(mockSuccess(null));

      await service.signOut();

      expect(mockClient.auth.signOut).toHaveBeenCalled();
      expect(service.user()).toBeNull();
      expect(service.session()).toBeNull();
      expect(service.profile()).toBeNull();
    });
  });

  describe('requestCompanyJoin', () => {
    it('should create a join request with valid invitation code', async () => {
      // Set user as authenticated
      service['_user'].set({ id: 'test-user-id' } as User);

      const mockCompany = { id: 'company-id' };

      vi.mocked(mockClient.from).mockImplementation((table: string) => {
        if (table === 'companies') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccess(mockCompany)),
              }),
            }),
          } as any;
        }
        if (table === 'company_join_requests') {
          return {
            insert: vi.fn().mockResolvedValue(mockSuccess(null)),
          } as any;
        }
        return {} as any;
      });

      const result = await service.requestCompanyJoin('ABC12345');

      expect(result.success).toBe(true);
    });

    it('should handle invalid invitation code', async () => {
      service['_user'].set({ id: 'test-user-id' } as User);

      vi.mocked(mockClient.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockError('Not found')),
          }),
        }),
      } as any);

      const result = await service.requestCompanyJoin('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid invitation code');
    });
  });

  describe('getClient', () => {
    it('should return the Supabase client', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
    });
  });
});
