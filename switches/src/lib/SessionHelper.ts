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
      const sessionData = this.SwitchContext.data.session;
      if (sessionData.screenHeight) {
        sessionData.screenHeight = parseInt(sessionData.screenHeight, 10);
      }

      if (sessionData.screenWidth) {
        sessionData.screenWidth = parseInt(sessionData.screenWidth, 10);
      }

      return new Session(sessionData);
    }

    // NOTE: for mock purposes, this must be any real value that is not localhost, 127.0.0.1 or otherwise a reserved "localhost" IP address
    return new Session({
      ip: '1.1.1.1'
    });
  };
}
