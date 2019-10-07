import * as stackTrace from 'stack-trace';

export const error = (message: string, error: Error) => {
  log(message, error);
  throw new Error(`${message}: ${error.message}`);
}

export const log = (message: string, error: Error) => {
  try {
    console.warn(message);
    console.error(`${error.message}: ${error.name}: ${error.stack}`);
    console.info(stackTrace.parse(error));
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
