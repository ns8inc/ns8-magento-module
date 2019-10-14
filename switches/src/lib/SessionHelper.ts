import { Session } from 'ns8-protect-models';
import { HelperBase } from './HelperBase';

export class SessionHelper extends HelperBase {

  private getIpAddress = ():string => {
    //NOTE: for mock purposes, this must be any real value that is not localhost, 127.0.0.1 or otherwise a reserved "localhost" IP address
    let ret = '1.1.1.1'; //DNS Server IP
    if (this.SwitchContext.data && this.SwitchContext.data.order && this.SwitchContext.data.order.remote_ip) {
      ret = this.SwitchContext.data.order.remote_ip;
    }
    return ret;
  }

  //TODO: ship this data from Magento
  public toSession = (): Session => {
    return new Session({
      ip: this.getIpAddress(),
    });
  }
}
