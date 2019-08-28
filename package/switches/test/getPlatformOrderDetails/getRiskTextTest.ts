import { expect } from 'chai';
import { Risk } from 'ns8-protect-models';
import { getRiskText } from '../../src/getPlatformOrderDetails';

describe('getRiskText', () => {
  it('Protect Risk.LOW should equal \'Low\'', () => {
    expect(getRiskText(Risk.LOW)).to.equal('Low');
  });

  it('Protect Risk.MEDIUM should equal \'Medium\'', () => {
    expect(getRiskText(Risk.MEDIUM)).to.equal('Medium');
  });

  it('Protect Risk.HIGH should equal \'High\'', () => {
    expect(getRiskText(Risk.HIGH)).to.equal('High');
  });

  it('No Protect Risk should return \'None\'', () => {
    expect(getRiskText('' as any)).to.equal('None');
  });
});
