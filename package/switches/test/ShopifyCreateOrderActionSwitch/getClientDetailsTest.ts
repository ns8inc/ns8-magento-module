import { expect } from 'chai';
import { IDraftOrderNoteAttribute, IOrder, IOrderClientDetails } from 'shopify-api-node';
import { getClientDetails, makeTestClientDetails } from '../../src';
import { orderFromPartial } from '../objectGenerators/Shopify.IOrder';

describe('getClientDetails', () => {
  const noteAttributesData: IDraftOrderNoteAttribute[] = [
    { name: 'ip', value: '1.2.3.4' },
    { name: 'ua', value: 'user-agent-string' },
    { name: 'accept_language', value: 'en-US' },
  ];
  const clientDetailsData: IOrderClientDetails = {
    accept_language: 'fr-CA',
    browser_height: null,
    browser_ip: '9.8.7.6',
    browser_width: null,
    session_hash: null,
    user_agent: 'Mozilla',
  };
  const clientDetailsKeys = [
    'accept_language',
    'browser_height',
    'browser_ip',
    'browser_width',
    'session_hash',
    'user_agent',
  ];

  describe('Demo Orders', () => {
    describe('without client_details', () => {
      it('with populated note_attributes should return client_details', () => {
        const order: IOrder = orderFromPartial({
          source_name: 'demo',
          note_attributes: noteAttributesData,
        });
        delete order.client_details;

        const results: IOrderClientDetails | Error = getClientDetails(order);

        expect(results).to.have.all.keys(clientDetailsKeys);
        expect(results).to.not.be.an.instanceof(Error);
        if (!(results instanceof Error)) {
          expect(results.browser_ip).to.equal('1.2.3.4');
          expect(results.accept_language).to.equal('en-US');
          expect(results.user_agent).to.equal('user-agent-string');
        }
      });

      it('without populated note_attributes should return an Error', () => {
        const order = orderFromPartial({
          source_name: 'demo',
          note_attributes: [],
        });
        delete order.client_details;

        const results: IOrderClientDetails | Error = getClientDetails(order);

        expect(results).to.be.an.instanceof(Error);
      });

      it('with undefined note_attributes should return an Error', () => {
        const order = orderFromPartial({
          source_name: 'demo',
        });
        delete order.client_details;
        delete order.note_attributes;

        const results: IOrderClientDetails | Error = getClientDetails(order);

        expect(results).to.be.an.instanceof(Error);
      });
    });

    describe('with client_details', () => {
      it('should disregard the note_attributes and use the client_details data', () => {
        const order: IOrder = orderFromPartial({
          source_name: 'demo',
          note_attributes: noteAttributesData,
          client_details: clientDetailsData,
        });

        const results: IOrderClientDetails | Error = getClientDetails(order);

        expect(results).to.have.all.keys(clientDetailsKeys);
        expect(results).to.not.be.an.instanceof(Error);
        if (!(results instanceof Error)) {
          expect(results.browser_ip).to.equal(clientDetailsData.browser_ip);
          expect(results.accept_language).to.equal(clientDetailsData.accept_language);
          expect(results.user_agent).to.equal(clientDetailsData.user_agent);
        }
      });
    });
  });

  describe('Test orders', () => {
    describe('without client_details', () => {
      it('should return the set of test values as a client_details object', () => {
        const order: IOrder = orderFromPartial({
          test: true,
        });
        delete order.client_details;

        const results: IOrderClientDetails | Error = getClientDetails(order);
        const testValues: IOrderClientDetails = makeTestClientDetails();

        expect(results).to.have.all.keys(clientDetailsKeys);
        expect(results).to.not.be.an.instanceof(Error);
        if (!(results instanceof Error)) {
          expect(results.accept_language).to.equal(testValues.accept_language);
          expect(results.browser_ip).to.equal(testValues.browser_ip);
          expect(results.user_agent).to.equal(testValues.user_agent);
        }
      });
    });

    describe('with client_details', () => {
      it('should use the actual values and disregard the set of test values', () => {
        const order: IOrder = orderFromPartial({
          test: true,
          client_details: clientDetailsData,
        });

        const results: IOrderClientDetails | Error = getClientDetails(order);

        expect(results).to.have.all.keys(clientDetailsKeys);
        expect(results).to.not.be.an.instanceof(Error);
        if (!(results instanceof Error)) {
          expect(results.browser_ip).to.equal(clientDetailsData.browser_ip);
          expect(results.accept_language).to.equal(clientDetailsData.accept_language);
          expect(results.user_agent).to.equal(clientDetailsData.user_agent);
        }
      });
    });
  });

  describe('Organic orders', () => {
    describe('without client_details', () => {
      it('should return an Error', () => {
        const order: IOrder = orderFromPartial({
          test: false,
        });
        delete order.client_details;

        const results: IOrderClientDetails | Error = getClientDetails(order);

        expect(results).to.be.an.instanceof(Error);
      });
    });

    describe('with client_details', () => {
      it('should return the same client details', () => {
        const order: IOrder = orderFromPartial({
          test: false,
          client_details: clientDetailsData,
        });

        const results: IOrderClientDetails | Error = getClientDetails(order);

        expect(results).to.have.all.keys(clientDetailsKeys);
        expect(results).to.not.be.an.instanceof(Error);
        if (!(results instanceof Error)) {
          expect(results.browser_ip).to.equal(clientDetailsData.browser_ip);
          expect(results.accept_language).to.equal(clientDetailsData.accept_language);
          expect(results.user_agent).to.equal(clientDetailsData.user_agent);
        }
      });
    });
  });

  describe('client_details validation', () => {
    it('should return an error if provided an empty string for IP address', () => {
      const order: IOrder = orderFromPartial({
        test: false,
        client_details: clientDetailsData,
      });
      order.client_details.browser_ip = '';

      const results: IOrderClientDetails | Error = getClientDetails(order);

      expect(results).to.be.an.instanceof(Error);
    });

    it('should return an error if provided an undefined IP address', () => {
      const order: IOrder = orderFromPartial({
        test: false,
        client_details: clientDetailsData,
      });
      delete order.client_details.browser_ip;

      const results: IOrderClientDetails | Error = getClientDetails(order);

      expect(results).to.be.an.instanceof(Error);
    });

    it('should return an error if the IP address string is shorter than 7 characters', () => {
      const order: IOrder = orderFromPartial({
        test: false,
        client_details: clientDetailsData,
      });
      order.client_details.browser_ip = '1.2.3';

      const results: IOrderClientDetails | Error = getClientDetails(order);

      expect(results).to.be.an.instanceof(Error);
    });
  });
});
