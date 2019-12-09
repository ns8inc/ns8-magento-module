import { CustomerVerification } from 'ns8-protect-models';
import { HelperBase } from './HelperBase';

export class CustomerVerificationHelper extends HelperBase {
  public toCustomerVerification = (): CustomerVerification => {
    return new CustomerVerification();
  };
}
