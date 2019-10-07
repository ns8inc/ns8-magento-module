import * as stackTrace from 'stack-trace';

export const log = (message: string, error: Error) => {
  console.warn(message);
  console.error(`${error.message}: ${error.name}: ${error.stack}`);
  console.info(stackTrace.parse(error));
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
