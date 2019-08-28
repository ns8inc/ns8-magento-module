import { expect } from 'chai';
import { formatPhoneNumber } from '../../src';

describe('formatPhoneNumber', () => {
  const e164String: string = '+12223334444';
  const validSubscriberNumberWithCodeString: string = '+1 (222) 333-4444';
  const validSubscriberNumberString: string = '(222) 333-4444';
  const invalidSubscriberNumberString: string = 'NS8';
  const validCountryCode: string = 'US';
  const invalidCountryCode: string = 'ZX';

  describe('returns an E.164 string when', () => {
    it('provided with an E.164 string and undefined country code', () => {
      const results: string = formatPhoneNumber(e164String, undefined);

      expect(results).to.equal(e164String);
    });

    it('provided with an E.164 string and a null country code', () => {
      const results: string = formatPhoneNumber(e164String, null);

      expect(results).to.equal(e164String);
    });

    it('provided with an E.164 string and an empty string country code', () => {
      const results: string = formatPhoneNumber(e164String, '');

      expect(results).to.equal(e164String);
    });

    it('provided with an E.164 string and an invalid country code', () => {
      const results: string = formatPhoneNumber(e164String, invalidCountryCode);

      expect(results).to.equal(e164String);
    });

    it('provided with an E.164 string and a valid country code', () => {
      const results: string = formatPhoneNumber(e164String, validCountryCode);

      expect(results).to.equal(e164String);
    });

    it('provided with a subscriber number string containing a numeric country code', () => {
      const results: string = formatPhoneNumber(validSubscriberNumberWithCodeString);

      expect(results).to.equal(e164String);
    });

    it('provided with a valid subscriber number and a country code', () => {
      const results: string = formatPhoneNumber(validSubscriberNumberString, validCountryCode);

      expect(results).to.equal(e164String);
    });
  });

  describe('returns undefined when', () => {
    it('provided with an invalid subscriber number string and undefined country code', () => {
      const results: string = formatPhoneNumber(invalidSubscriberNumberString, undefined);

      expect(results).to.be.undefined;
    });

    it('provided with an invalid subscriber number string and a null country code', () => {
      const results: string = formatPhoneNumber(invalidSubscriberNumberString, null);

      expect(results).to.be.undefined;
    });

    it('provided with an invalid subscriber number an empty string country code', () => {
      const results: string = formatPhoneNumber(invalidSubscriberNumberString, '');

      expect(results).to.be.undefined;
    });

    it('provided with an invalid subscriber number an invalid country code', () => {
      const results: string = formatPhoneNumber(invalidSubscriberNumberString, invalidCountryCode);

      expect(results).to.be.undefined;
    });

    it('provided with an invalid subscriber number an valid country code', () => {
      const results: string = formatPhoneNumber(invalidSubscriberNumberString, validCountryCode);

      expect(results).to.be.undefined;
    });
  });

  it('the E.164 numeric code should take priority over a valid country code', () => {
    const results: string = formatPhoneNumber(e164String, 'RU');

    expect(results.startsWith('+1')).to.be.true;
    expect(results.startsWith('+7')).to.be.false;
  });
});
