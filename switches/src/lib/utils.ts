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

export enum OrderState {
  CREATED = 'created',
  UPDATED = 'updated'
}
