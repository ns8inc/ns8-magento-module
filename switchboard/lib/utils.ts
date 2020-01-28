import { Logger } from '@ns8/ns8-protect-sdk';
import { Utilities } from '@ns8/ns8-protect-sdk';
import { OrderState as MagentoOrderState } from '@ns8/magento2-rest-client';

export class RetryConfig {
  constructor(partial: Partial<RetryConfig> = {}) {
    Object.assign(this, partial || {});
    this.attempts = partial.attempts || 0;
    this.maxRetry = partial.maxRetry || 5;
    this.waitMs = partial.waitMs || 2000;
  }

  key: number | string | undefined;

  attempts: number;

  maxRetry: number;

  waitMs: number;
}

/**
 * Handles specific conditions in API errors.
 * If a 404, will execute a simple retry loop.
 * Returns `false` if the API error is unhandled; otherwise returns the API response.
 */
/* eslint no-param-reassign: ["error", { "props": false }] */
export const handleApiError = async (
  error: { statusCode: number },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retryCallback: () => any,
  retryConfig: RetryConfig = new RetryConfig(),
): Promise<boolean> => {
  if (error?.statusCode === 404 && retryConfig.attempts < retryConfig.maxRetry) {
    retryConfig.attempts += 1;
    Logger.log(
      `404 fetching key "${retryConfig.key}". Retry #${retryConfig.attempts}/${retryConfig.maxRetry} in ${retryConfig.waitMs}ms`,
    );
    await Utilities.sleep(retryConfig.waitMs);
    return retryCallback();
  }
  Logger.log(`404 fetching key "${retryConfig.key}". ${retryConfig.maxRetry} retries attempted`);
  return false;
};

export enum ProtectOrderUpdateStatus {
  CREATED = 'created',
  UPDATED = 'updated',
}

export enum ProtectOrderState {
  APPROVED = 'ns8_approved',
  CANCELED = 'canceled',
  MERCHANT_REVIEW = 'ns8_merchant_review',
}

export const existsInEnum = (enm: object, key: string): boolean => Object.values(enm).some((v) => v === key);

export const isValidMagentoState = (key: string): boolean => existsInEnum(MagentoOrderState, key);
