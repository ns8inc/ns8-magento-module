import { Utilities, Logger } from '@ns8/ns8-protect-sdk';

export class RetryConfig {
  constructor(partial: Partial<RetryConfig> = {}) {
    Object.assign(this, partial || {});
    this.attempts = partial.attempts || 0
    this.maxRetry = partial.maxRetry || 5
    this.waitMs = partial.waitMs || 2000
  }
  key: number | string;
  attempts: number;
  maxRetry: number;
  waitMs: number;
}

/**
 * Handles specific conditions in API errors.
 * If a 404, will execute a simple retry loop.
 * Returns `false` if the API error is unhandled; otherwise returns the API response.
 */
export const handleApiError = async (error, callback, retryConfig: RetryConfig = new RetryConfig()): Promise<any> => {
  if (error.statusCode === 404 && retryConfig.attempts < retryConfig.maxRetry) {
    retryConfig.attempts += 1;
    Logger.log(`404 fetching key "${retryConfig.key}". Retry #${retryConfig.attempts}/${retryConfig.maxRetry} in ${retryConfig.waitMs}ms`);
    await Utilities.sleep(retryConfig.waitMs);
    return await callback();
  } else {
    Logger.log(`404 fetching key "${retryConfig.key}". ${retryConfig.maxRetry} retries attempted`);
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

export enum MagentoState {
  APPROVED = 'ns8_approved',
  CANCELED = 'canceled',
  CLOSED = 'closed',
  COMPLETE = 'complete',
  MERCHANT_REVIEW = 'ns8_merchant_review',
  ON_HOLD = 'holded',
  PAYMENT_REVIEW = 'payment_review',
  PENDING = 'new',
  PENDING_PAYMENT = 'pending_payment',
  PROCESSING = 'processing',
}

export const existsInEnum = (enm: object, key: string): boolean => Object.values(enm).some((v) => v === key);

export const isValidMagentoState = (key: string): boolean => existsInEnum(MagentoState, key);
