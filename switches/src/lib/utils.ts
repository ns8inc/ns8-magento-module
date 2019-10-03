import * as stackTrace from 'stack-trace';

const log = (message: string, error: Error) => {
  console.warn(message);
  console.error(`${error.message}: ${error.name}: ${error.stack}`);
  console.info(stackTrace.parse(error));
}

const toDate = (date: string | undefined): Date | undefined => {
  let ret: Date | undefined;
  if (date) {
    ret = new Date(date);
  }
  return ret;
}

export {
  log,
  toDate
}
