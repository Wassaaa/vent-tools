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
    it('should save to localStorage when not authenticated', async () => {
      mockSupabaseService.isAuthenticated.mockReturnValue(false);

      const parts = [
        { partType: 'round', size: 125, amount: 5, conditions: [] },
      ];

      const result = await service.saveEntry(parts);

      expect(result.success).toBe(true);

      const stored = localStorage.getItem('vw_entries');
      expect(stored).toBeTruthy();
      const entries = JSON.parse(stored!);
      expect(entries).toHaveLength(1);
      expect(entries[0].parts_data).toEqual(parts);
    });

    it('should save to Supabase when authenticated', async () => {
      mockSupabaseService.isAuthenticated.mockReturnValue(true);
      mockSupabaseService.user.mockReturnValue({ id: 'test-user-id' } as User);

      const mockInsert = vi.fn().mockResolvedValue(mockSuccess(null));
      mockSupabaseService.getClient.mockReturnValue({
        from: vi.fn(() => ({
          insert: mockInsert,
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

  describe('hasLocalStorageData', () => {
    it('should return false when localStorage is empty', () => {
      expect(service.hasLocalStorageData()).toBe(false);
    });

    it('should return true when localStorage has data', async () => {
      mockSupabaseService.isAuthenticated.mockReturnValue(false);

      const parts = [
        { partType: 'round', size: 125, amount: 5, conditions: [] },
      ];

      await service.saveEntry(parts);

      expect(service.hasLocalStorageData()).toBe(true);
    });
  });

  describe('migrateLocalStorageToSupabase', () => {
    it('should migrate localStorage entries to Supabase', async () => {
      const entries = [
        {
          id: '1',
          entry_date: '2026-01-23',
          parts_data: [
            { partType: 'round', size: 125, amount: 3, conditions: [] },
          ],
          status: 'draft',
        },
        {
          id: '2',
          entry_date: '2026-01-24',
          parts_data: [
            { partType: 'square', size: 200, amount: 2, conditions: [] },
          ],
          status: 'draft',
        },
      ];
      localStorage.setItem('vw_entries', JSON.stringify(entries));

      mockSupabaseService.user.mockReturnValue({ id: 'test-user-id' } as User);

      const mockInsert = vi.fn().mockResolvedValue(mockSuccess(null));
      mockSupabaseService.getClient.mockReturnValue({
        from: vi.fn(() => ({
          insert: mockInsert,
        })),
      });

      const result = await service.migrateLocalStorageToSupabase('company-id');

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(2);
      expect(mockInsert).toHaveBeenCalledWith([
        {
          user_id: 'test-user-id',
          company_id: 'company-id',
          entry_date: '2026-01-23',
          parts_data: entries[0].parts_data,
          status: 'draft',
        },
        {
          user_id: 'test-user-id',
          company_id: 'company-id',
          entry_date: '2026-01-24',
          parts_data: entries[1].parts_data,
          status: 'draft',
        },
      ]);

      expect(localStorage.getItem('vw_entries')).toBeNull();
    });

    it('should return 0 migrated when localStorage is empty', async () => {
      mockSupabaseService.user.mockReturnValue({ id: 'test-user-id' } as User);

      const result = await service.migrateLocalStorageToSupabase('company-id');

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(0);
    });

    it('should require authentication', async () => {
      mockSupabaseService.user.mockReturnValue(null);

      const result = await service.migrateLocalStorageToSupabase('company-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
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
      expect(result.error).toBe('Must be logged in to update status');
    });
  });
});
