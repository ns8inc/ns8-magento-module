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

/**
 * Safely handle boolean responses and throw an Error if we do not get an expected result
 * @param httpResponse
 */
export const validateBooleanHttpResponse = (httpResponse: any): boolean => {
  //The response may not be strongly typed; but we expect `httpResponse == true` or `httpResponse == 'true'` or `httpResponse == '1'` or `httpResponse == 1`;
  //If we get anything else, it is probably an error?
  const ret = (httpResponse === true || httpResponse === 'true' || httpResponse === 'True' || httpResponse === '1' || httpResponse === 1);
  if (!ret) throw new Error('Failed to get an expected boolean response.');
  return ret;
}

export enum OrderState {
  CREATED = 'created',
  UPDATED = 'updated'
}

export enum MagentoStatus {
  CANCELED = 'canceled',
  CLOSED = 'closed',
  COMPLETE = 'complete',
  ON_HOLD = 'holded',
  PAYMENT_REVIEW = 'payment_review',
  PENDING = 'pending',
  PENDING_PAYMENT = 'pending_payment',
  PROCESSING = 'processing',
  SUSPECTED_FRAUD = 'fraud',
}

export enum MagentoState {
  CANCELED = 'canceled',
  CLOSED = 'closed',
  COMPLETE = 'complete',
  ON_HOLD = 'holded',
  PAYMENT_REVIEW = 'payment_review',
  PENDING = 'new',
  PENDING_PAYMENT = 'pending_payment',
  PROCESSING = 'processing',
  SUSPECTED_FRAUD = 'processing',
}

export const isValidMagentoStatus = (key: string): boolean => MagentoStatus[key];
export const isValidMagentoState = (key: string): boolean => MagentoState[key];
