import { Utilities } from '@ns8/ns8-protect-sdk';

/**
 * Handles specific conditions in API errors.
 * If a 404, will execute a simple retry loop.
 * Returns `false` if the API error is unhandled; otherwise returns the API response.
 */
export const handleApiError = async (error, method, params, attempts: number = 0, maxRetry: number = 5, waitMs: number = 2000): Promise<any> => {
  if (error.statusCode === 404 && attempts < maxRetry) {
    attempts += 1;
    await Utilities.sleep(waitMs);
    const args = [...params, attempts, maxRetry, waitMs];
    return await method(...args);
  } else {
    return false;
  }
}

export enum OrderState {
  CREATED = 'created',
  UPDATED = 'updated'
}
