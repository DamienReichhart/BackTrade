import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../index';

// Mock fetch globally
global.fetch = vi.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient('http://localhost:3001');
    vi.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should fetch and validate health data successfully', async () => {
      const mockHealthData = {
        status: 'ok' as const,
        time: '2024-01-15T10:30:00.000Z'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealthData)
      });

      const result = await apiClient.getHealth();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/health',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual(mockHealthData);
    });

    it('should throw error when health data is invalid', async () => {
      const invalidHealthData = {
        status: 'invalid',
        time: 'not-a-date'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(invalidHealthData)
      });

      await expect(apiClient.getHealth()).rejects.toThrow();
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.getHealth()).rejects.toThrow('Network error');
    });

    it('should throw error when response is not ok', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(apiClient.getHealth()).rejects.toThrow('HTTP error! status: 500');
    });
  });
});
