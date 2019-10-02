import * as stackTrace from 'stack-trace';

const log = (message: string, error: Error) => {
  console.warn(message);
  console.error(`${error.message}: ${error.name}: ${error.stack}`);
  console.info(stackTrace.parse(error));
}

export {
  log
}
