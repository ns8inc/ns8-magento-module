import { Session } from 'ns8-protect-models';
import { HelperBase } from './HelperBase';

export class SessionHelper extends HelperBase {

  //TODO: ship this data from Magento
  public toSession = (): Session => {
    return new Session({
      //NOTE: for mock purposes, this must be any real value that is not localhost, 127.0.0.1 or otherwise a reserved "localhost" IP address
      ip: '1.1.1.1',
    });
  }
}
