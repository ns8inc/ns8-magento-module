import { expect } from 'chai';
import { CustomerVerification, CustomerVerificationStatus } from 'ns8-protect-models';
import { getCustomerVerificationText } from '../../src/getPlatformOrderDetails';

describe('getCustomerVerificationText', () => {
  let customerVerification: CustomerVerification;

  afterEach(() => {
    customerVerification = null;
  });

  it('Protect CustomerVerificationStatus.EMAIL_SENT should equal \'Low\'', () => {
    customerVerification = new CustomerVerification({ status: CustomerVerificationStatus.EMAIL_SENT });
    expect(getCustomerVerificationText(customerVerification)).to.equal('Email Sent');
  });

  it('Protect CustomerVerificationStatus.CUSTOMER_DENIED should equal \'Failed\'', () => {
    customerVerification = new CustomerVerification({ status: CustomerVerificationStatus.CUSTOMER_DENIED });
    expect(getCustomerVerificationText(customerVerification)).to.equal('Failed');
  });

  it('Protect CustomerVerificationStatus.SMS_SEND should equal \'SMS Sent\'', () => {
    customerVerification = new CustomerVerification({ status: CustomerVerificationStatus.SMS_SEND });
    expect(getCustomerVerificationText(customerVerification)).to.equal('SMS Sent');
  });

  it('Protect CustomerVerificationStatus.SMS_VERIFIED should equal \'Verified\'', () => {
    customerVerification = new CustomerVerification({ status: CustomerVerificationStatus.SMS_VERIFIED });
    expect(getCustomerVerificationText(customerVerification)).to.equal('Verified');
  });

  it('No CustomerVerification should return \'None\'', () => {
    expect(getCustomerVerificationText(customerVerification)).to.equal('None');
  });

  it('No CustomerVerification.status should return \'None\'', () => {
    customerVerification = new CustomerVerification();
    expect(getCustomerVerificationText(customerVerification)).to.equal('None');
  });
});
