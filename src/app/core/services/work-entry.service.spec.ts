import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from './supabase.service';
import { mockSuccess } from './test-utils/supabase-mock';
import { WorkEntryService } from './work-entry.service';

describe('WorkEntryService', () => {
  let service: WorkEntryService;
  let mockSupabaseService: {
    user: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    getClient: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSupabaseService = {
      user: vi.fn(() => null),
      isAuthenticated: vi.fn(() => false),
      getClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockSuccess([])),
          }),
          insert: vi.fn().mockResolvedValue(mockSuccess(null)),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockSuccess(null)),
          }),
        })),
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        WorkEntryService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });
    service = TestBed.inject(WorkEntryService);
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveEntry', () => {
    it('should save to Supabase when authenticated', async () => {
      mockSupabaseService.isAuthenticated.mockReturnValue(true);
      mockSupabaseService.user.mockReturnValue({ id: 'test-user-id' } as User);

      const mockInsert = vi.fn().mockResolvedValue(mockSuccess(null));
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      mockSupabaseService.getClient.mockReturnValue({
        from: vi.fn(() => ({
          insert: mockInsert,
          select: mockSelect,
        })),
      });

      const parts = [
        { partType: 'round', size: 125, amount: 5, conditions: [] },
      ];

      const result = await service.saveEntry(parts, 'company-id', '2026-01-24');

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        company_id: 'company-id',
        entry_date: '2026-01-24',
        parts_data: parts,
        status: 'draft',
      });
    });
  });

  describe('updateEntryStatus', () => {
    it('should update entry status in Supabase', async () => {
      mockSupabaseService.isAuthenticated.mockReturnValue(true);

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSuccess(null)),
      });

      mockSupabaseService.getClient.mockReturnValue({
        from: vi.fn(() => ({
          update: mockUpdate,
        })),
      });

      const result = await service.updateEntryStatus('entry-id', 'submitted');

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'submitted' });
    });

    it('should require authentication', async () => {
      mockSupabaseService.isAuthenticated.mockReturnValue(false);

      const result = await service.updateEntryStatus('entry-id', 'submitted');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Must be logged in');
    });
  });
});
