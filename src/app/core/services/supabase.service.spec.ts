import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import type { User, Session } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { SupabaseService, SUPABASE_CLIENT } from './supabase.service';
import {
  createMockSupabaseClient,
  mockAuthError,
  mockError,
  mockSuccess,
} from './test-utils/supabase-mock';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: SUPABASE_CLIENT, useValue: mockClient },
      ],
    });
    service = TestBed.inject(SupabaseService);
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
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      } as User;

      (mockClient.auth.signUp as Mock).mockResolvedValue(
        mockSuccess({ user: mockUser, session: null as unknown as Session }),
      );

      (mockClient.from as Mock).mockReturnValue({
        insert: vi.fn().mockResolvedValue(mockSuccess(null)),
      });

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
      (mockClient.auth.signUp as Mock).mockResolvedValue(
        mockAuthError('Email already exists') as any,
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
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      } as User;

      (mockClient.auth.signUp as Mock).mockResolvedValue(
        mockSuccess({ user: mockUser, session: null as unknown as Session }),
      );

      const mockInsert = vi.fn().mockResolvedValue(mockSuccess(null));
      (mockClient.from as Mock).mockReturnValue({
        insert: mockInsert,
      });

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
      (mockClient.auth.signInWithPassword as Mock).mockResolvedValue(
        mockSuccess({ user: { id: 'test-user-id' } as User, session: {} as Session }),
      );

      const result = await service.signIn('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login errors', async () => {
      (mockClient.auth.signInWithPassword as Mock).mockResolvedValue(
        mockAuthError('Invalid credentials') as any,
      );

      const result = await service.signIn('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('should sign out the current user', async () => {
      (mockClient.auth.signOut as Mock).mockResolvedValue(mockSuccess(null));

      await service.signOut();

      expect(mockClient.auth.signOut).toHaveBeenCalled();
      expect(service.user()).toBeNull();
      expect(service.session()).toBeNull();
      expect(service.profile()).toBeNull();
    });
  });

  describe('requestCompanyJoin', () => {
    it('should create a join request with valid invitation code', async () => {
      service.user.set({ id: 'test-user-id' } as User);

      (mockClient.rpc as Mock).mockResolvedValue(mockSuccess('company-id'));

      (mockClient.from as Mock).mockReturnValue({
        insert: vi.fn().mockResolvedValue(mockSuccess(null)),
      });

      const result = await service.requestCompanyJoin('ABC12345');

      expect(mockClient.rpc).toHaveBeenCalledWith('get_company_id_by_code', {
        _code: 'ABC12345',
      });
      expect(result.success).toBe(true);
    });

    it('should handle invalid invitation code', async () => {
      service.user.set({ id: 'test-user-id' } as User);

      (mockClient.rpc as Mock).mockResolvedValue(mockSuccess(null));

      const result = await service.requestCompanyJoin('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid invitation code');
    });

    it('should handle join request error', async () => {
      service.user.set({ id: 'test-user-id' } as User);

      (mockClient.rpc as Mock).mockResolvedValue(mockSuccess('company-id'));

      (mockClient.from as Mock).mockReturnValue({
        insert: vi.fn().mockResolvedValue(mockError('Some DB error')),
      });

      const result = await service.requestCompanyJoin('ABC12345');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create join request');
    });

    it('should handle already requested error', async () => {
      service.user.set({ id: 'test-user-id' } as User);

      (mockClient.rpc as Mock).mockResolvedValue(mockSuccess('company-id'));

      (mockClient.from as Mock).mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'Unique violation' },
        }),
      });

      const result = await service.requestCompanyJoin('ABC12345');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Join request already exists');
    });
  });

  describe('getClient', () => {
    it('should return the Supabase client', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
    });
  });
});
