import { Session } from 'ns8-protect-models';
import { HelperBase } from './HelperBase';

export class SessionHelper extends HelperBase {

  /**
   * Convert the session object.
   *
   * @return {Session} The session
   */
  public toSession = (): Session => {
    if (this.SwitchContext.data && this.SwitchContext.data.session) {
      return new Session(this.SwitchContext.data.session);
    }

    //NOTE: for mock purposes, this must be any real value that is not localhost, 127.0.0.1 or otherwise a reserved "localhost" IP address
    return new Session({
      ip: '1.1.1.1'
    });
  }
}
