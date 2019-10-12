import * as StackTracey from 'stacktracey';

export const error = (message: string, error: Error) => {
  log(message, error);
  throw new Error(`${message}: ${error.message}`);
}

/**
 * TODO: use a 3rd party logger like Winston or PINO
 * @param message
 * @param error
 */
export const log = (message: string, error: Error) => {
  try {
    console.warn(message);
    console.error(`${error.message}: ${error.name}: ${error.stack}`);
    console.info(new StackTracey(error).pretty);
  } catch {
    //Never fail in logging
  }
}

export const toDate = (date: string | undefined): Date | undefined => {
  let ret: Date | undefined;
  if (date) {
    ret = new Date(date);
  }
  return ret;
}

/**
 * Mechanism for synchronous wait.
 * Usage: `await this.sleep(5000)`
 */
export const sleep = async (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Handles specific conditions in API errors.
 * If a 404, will execute a simple retry loop.
 * Returns `false` if the API error is unhandled; otherwise returns the API response.
 */
export const handleApiError = async (error, method, params, attempts: number = 0, maxRetry: number = 5, waitMs: number = 2000): Promise<any> => {
  if (error.statusCode === 404 && attempts < maxRetry) {
    attempts += 1;
    await sleep(waitMs);
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
