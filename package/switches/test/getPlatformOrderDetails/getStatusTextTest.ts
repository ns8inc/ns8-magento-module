import { expect } from 'chai';
import { Status } from 'ns8-protect-models';
import { getStatusText } from '../../src/getPlatformOrderDetails';

describe('getStatusText', () => {
  it('Protect Status.APPROVED should equal \'Approved\'', () => {
    expect(getStatusText(Status.APPROVED)).to.equal('Approved');
  });

  it('Protect Status.MERCHANT_REVIEW should equal \'Merchant Review\'', () => {
    expect(getStatusText(Status.MERCHANT_REVIEW)).to.equal('Merchant Review');
  });

  it('Protect Status.CANCELLED should equal \'Canceled\' with one l', () => {
    expect(getStatusText(Status.CANCELLED)).to.equal('Canceled');
  });

  it('No Protect Status should return \'None\'', () => {
    expect(getStatusText('' as any)).to.equal('None');
  });
});
