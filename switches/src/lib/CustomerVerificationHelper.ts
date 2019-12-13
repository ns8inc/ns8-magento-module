import { CustomerVerification } from 'ns8-protect-models';
import { HelperBase } from '..';

export class CustomerVerificationHelper extends HelperBase {
  public toCustomerVerification = (): CustomerVerification => {
    return new CustomerVerification();
  };
}
