import { expect } from 'chai';
import { IPaymentDetails, TransactionKind } from 'shopify-api-node';
import { CreditCard } from 'ns8-protect-models';
import { mapCreditCard } from '../../src';
import { paymentDetailsFromPartial } from '../objectGenerators/Shopify';

describe('mapCreditCard', () => {
  const gateway: string = 'test gateway';
  const kinds: TransactionKind[] = [
    'authorization',
    'capture',
    'refund',
    'sale',
    'void',
    null,
    undefined,
  ];

  for (const kind of kinds) {
    describe(`TransactionKind: ${kind}`, () => {
      it(`should create a Protect CreditCard object`, () => {
        const paymentDetails: IPaymentDetails = paymentDetailsFromPartial();

        const results: CreditCard = mapCreditCard(paymentDetails, kind, gateway);

        expect(results).to.be.an.instanceof(CreditCard);
      });

      it('should create a Protect Credit card when all payment_details values are null', () => {
        const paymentDetails: IPaymentDetails = paymentDetailsFromPartial({
          avs_result_code: null,
          credit_card_bin: null,
          credit_card_company: null,
          credit_card_number: null,
          cvv_result_code: null,
        });

        const results: CreditCard = mapCreditCard(paymentDetails, kind, gateway);

        expect(results).to.be.an.instanceof(CreditCard);
      });

      it('should create a Protect Credit card when all payment_details values are undefined', () => {
        const paymentDetails: IPaymentDetails = paymentDetailsFromPartial({
          avs_result_code: undefined,
          credit_card_bin: undefined,
          credit_card_company: undefined,
          credit_card_number: undefined,
          cvv_result_code: undefined,
        });

        const results: CreditCard = mapCreditCard(paymentDetails, kind, gateway);

        expect(results).to.be.an.instanceof(CreditCard);
      });
    });
  }
});
