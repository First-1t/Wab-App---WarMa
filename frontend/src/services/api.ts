import { MatchInputDto, MatchOutputDto } from '../types/scenario.types';

export class ApiError extends Error {
  status: number;
  error?: string;
  details?: string[];
  isNotFound?: boolean;
  isNetworkError?: boolean;

  constructor(options: {
    message: string;
    status: number;
    error?: string;
    details?: string[];
    isNotFound?: boolean;
    isNetworkError?: boolean;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.error = options.error;
    this.details = options.details;
    this.isNotFound = options.isNotFound;
    this.isNetworkError = options.isNetworkError;
  }
}

/**
 * WarMa Output Module API Client
 */
export const outputApiClient = {
  /**
   * Send input parameters to backend to match scenario and compute yield/water
   */
  async matchScenario(input: MatchInputDto): Promise<MatchOutputDto> {
    try {
      const response = await fetch('/api/output/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new ApiError({
            message:
              data.message ||
              'No matching scenario found for the specified input conditions.',
            status: 404,
            error: data.error || 'SCENARIO_NOT_FOUND',
            isNotFound: true,
          });
        }

        if (response.status === 400) {
          throw new ApiError({
            message:
              data.message ||
              'Input validation failed. Please review the highlighted fields.',
            status: 400,
            error: data.error || 'VALIDATION_ERROR',
            details: Array.isArray(data.details) ? data.details : undefined,
          });
        }

        throw new ApiError({
          message: data.message || `Request failed with status code ${response.status}`,
          status: response.status,
          error: data.error,
        });
      }

      return data as MatchOutputDto;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }

      // Handle network errors (e.g. backend server offline, connection refused)
      const errorMsg =
        err instanceof Error ? err.message : 'Unknown network failure';
      throw new ApiError({
        message: `Cannot connect to WarMa Backend Server (Port 5000). Please ensure the backend is running. (${errorMsg})`,
        status: 0,
        isNetworkError: true,
      });
    }
  },

  /**
   * Check Backend Server Health
   */
  async checkHealth(): Promise<{ status: string; scenarioCount?: number }> {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return res.json();
  },
};
