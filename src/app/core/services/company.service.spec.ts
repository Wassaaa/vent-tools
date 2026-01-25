import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyService } from './company.service';
import { SupabaseService } from './supabase.service';
import { mockSuccess } from './test-utils/supabase-mock';

describe('CompanyService', () => {
  let service: CompanyService;
  let mockSupabaseService: {
    user: ReturnType<typeof vi.fn>;
    isManager: ReturnType<typeof vi.fn>;
    getClient: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSupabaseService = {
      user: vi.fn(() => null),
      isManager: vi.fn(() => false),
      getClient: vi.fn(() => ({
        from: vi.fn(() => ({
          insert: vi.fn(),
          select: vi.fn(),
          update: vi.fn(),
        })),
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CompanyService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });
    service = TestBed.inject(CompanyService);
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCompany', () => {
    it('should create a company with generated invitation code', async () => {
      mockSupabaseService.user.mockReturnValue({ id: 'manager-id' } as User);
      mockSupabaseService.isManager.mockReturnValue(true);

      const mockCompany = {
        id: 'company-id',
        name: 'Test Company',
        invitation_code: 'ABC12345',
        created_by: 'manager-id',
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSuccess(mockCompany)),
        }),
      });

      mockSupabaseService.getClient.mockReturnValue({
        rpc: vi.fn().mockResolvedValue({ data: 'ABC23456', error: null }),
        from: vi.fn((table: string) => {
          if (table === 'companies') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  maybeSingle: vi
                    .fn()
                    .mockResolvedValue(mockSuccess(mockCompany)),
                }),
              }),
            };
          }
          if (table === 'user_companies') {
            return { insert: vi.fn().mockResolvedValue(mockSuccess(null)) };
          }
          return {};
        }),
      });

      const result = await service.createCompany('Test Company');

      expect(result.success).toBe(true);
      expect(result.company).toBeDefined();
      expect(result.company?.name).toBe('Test Company');
      expect(result.company?.invitation_code).toMatch(/^[A-Z0-9]{8}$/);
    });

    it('should require manager role', async () => {
      mockSupabaseService.user.mockReturnValue({ id: 'worker-id' } as User);
      mockSupabaseService.isManager.mockReturnValue(false);

      const result = await service.createCompany('Test Company');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only managers can create companies');
    });

    it('should require authentication', async () => {
      mockSupabaseService.user.mockReturnValue(null);

      const result = await service.createCompany('Test Company');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });

    it('should add manager as company member', async () => {
      mockSupabaseService.user.mockReturnValue({ id: 'manager-id' } as User);
      mockSupabaseService.isManager.mockReturnValue(true);

      const mockCompany = {
        id: 'company-id',
        name: 'Test Company',
        invitation_code: 'ABC12345',
      };

      const mockMemberInsert = vi.fn().mockResolvedValue(mockSuccess(null));

      mockSupabaseService.getClient.mockReturnValue({
        rpc: vi.fn().mockResolvedValue({ data: 'ABC23456', error: null }),
        from: vi.fn((table: string) => {
          if (table === 'companies') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  maybeSingle: vi
                    .fn()
                    .mockResolvedValue(mockSuccess(mockCompany)),
                }),
              }),
            };
          }
          if (table === 'user_companies') {
            return { insert: mockMemberInsert };
          }
          return {};
        }),
      });

      await service.createCompany('Test Company');

      expect(mockMemberInsert).toHaveBeenCalledWith({
        user_id: 'manager-id',
        company_id: 'company-id',
        is_active: true,
      });
    });
  });

  describe('approveJoinRequest', () => {
    it('should approve a join request and add user to company', async () => {
      mockSupabaseService.user.mockReturnValue({ id: 'manager-id' } as User);
      mockSupabaseService.isManager.mockReturnValue(true);

      const mockRequest = {
        id: 'request-id',
        user_id: 'worker-id',
        company_id: 'company-id',
        status: 'pending',
      };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSuccess(null)),
      });

      const mockInsert = vi.fn().mockResolvedValue(mockSuccess(null));

      mockSupabaseService.getClient.mockReturnValue({
        from: vi.fn((table: string) => {
          if (table === 'company_join_requests') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi
                    .fn()
                    .mockResolvedValue(mockSuccess(mockRequest)),
                }),
              }),
              update: mockUpdate,
            };
          }
          if (table === 'user_companies') {
            return { insert: mockInsert };
          }
          return {};
        }),
      });

      const result = await service.approveJoinRequest('request-id');

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'worker-id',
        company_id: 'company-id',
        is_active: true,
      });
    });

    it('should require manager role', async () => {
      mockSupabaseService.user.mockReturnValue({ id: 'worker-id' } as User);
      mockSupabaseService.isManager.mockReturnValue(false);

      const result = await service.approveJoinRequest('request-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authorized');
    });
  });

  describe('rejectJoinRequest', () => {
    it('should reject a join request', async () => {
      mockSupabaseService.user.mockReturnValue({ id: 'manager-id' } as User);
      mockSupabaseService.isManager.mockReturnValue(true);

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSuccess(null)),
      });

      mockSupabaseService.getClient.mockReturnValue({
        from: vi.fn(() => ({
          update: mockUpdate,
        })),
      });

      const result = await service.rejectJoinRequest('request-id');

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'rejected',
          reviewed_by: 'manager-id',
        }),
      );
    });
  });

  describe('generateInvitationCode', () => {
    it('should generate an 8-character alphanumeric code', async () => {
      mockSupabaseService.user.mockReturnValue({ id: 'manager-id' } as User);
      mockSupabaseService.isManager.mockReturnValue(true);

      mockSupabaseService.getClient.mockReturnValue({
        rpc: vi.fn().mockResolvedValue({ data: 'ABC23456', error: null }),
        from: vi.fn(() => ({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue(
                mockSuccess({
                  id: 'company-id',
                  name: 'Test',
                  invitation_code: 'ABC23456',
                }),
              ),
            }),
          }),
        })),
      });

      const result = await service.createCompany('Test');

      expect(result.company?.invitation_code).toMatch(/^[A-Z0-9]{8}$/);
      // Should not contain ambiguous characters
      expect(result.company?.invitation_code).not.toMatch(/[01OI]/);
    });
  });
});
