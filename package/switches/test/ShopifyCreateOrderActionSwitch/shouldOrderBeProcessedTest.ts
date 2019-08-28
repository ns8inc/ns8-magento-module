import { expect } from 'chai';
import { IPaymentDetails, ITransaction, TransactionKind, TransactionStatus } from 'shopify-api-node';
import { shouldOrderBeProcessed } from '../../src';
import { paymentDetailsFromPartial, transactionFromPartial } from '../objectGenerators/Shopify.ITransaction';

describe('shouldOrderBeProcessed', () => {
  const statuses: TransactionStatus[] = ['error', 'failure', 'pending', 'success'];
  const kinds: TransactionKind[] = ['authorization', 'capture', 'refund', 'sale', 'void'];
  const paymentDetails: IPaymentDetails = paymentDetailsFromPartial();

  describe('Non-credit-card transactions (no payment_details)', () => {
    for (const status of statuses) {
      for (const kind of kinds) {
        let expectation: string = 'FAIL';

        if (kind !== 'void' && kind !== 'refund' && kind !== 'capture' &&
          (status === 'pending' || status === 'success')) {
          expectation = 'PASS';
        }

        it(`should ${expectation} with\tstatus=${status}\tkind=${kind}`, () => {
          const transaction: ITransaction = transactionFromPartial({
            kind,
            status,
          });
          delete transaction.payment_details;

          const results = shouldOrderBeProcessed(transaction);

          if (expectation === 'PASS') {
            expect(results).to.be.true;
          } else {
            expect(results).to.be.false;
          }
        });
      }
    }
  });

  describe('Credit card transactions (with payment_details)', () => {
    for (const status of statuses) {
      for (const kind of kinds) {
        let expectation: string = 'FAIL';

        if (status === 'success' && (kind === 'sale' || kind === 'authorization')) {
          expectation = 'PASS';
        }

        it(`should ${expectation} with\tstatus=${status}\tkind=${kind}`, () => {

          const transaction: ITransaction = transactionFromPartial({
            kind,
            status,
            payment_details: paymentDetails,
          });

          const results = shouldOrderBeProcessed(transaction);

          if (expectation === 'PASS') {
            expect(results).to.be.true;
          } else {
            expect(results).to.be.false;
          }
        });
      }
    }
  });

  describe('Point-of-sale transactions (source_name=pos)', () => {
    describe('with no payment_details object', () => {
      for (const status of statuses) {
        for (const kind of kinds) {
          it(`should never process\tstatus=${status}\tkind=${kind}`, () => {

            const transaction: ITransaction = transactionFromPartial({
              kind,
              status,
              source_name: 'pos',
            });
            delete transaction.payment_details;

            const results = shouldOrderBeProcessed(transaction);

            expect(results).to.be.false;
          });
        }
      }
    });

    describe('with a payment_details object', () => {
      for (const status of statuses) {
        for (const kind of kinds) {
          it(`should never process\tstatus=${status}\tkind=${kind}`, () => {

            const transaction: ITransaction = transactionFromPartial({
              kind,
              status,
              source_name: 'pos',
              payment_details: paymentDetails,
            });

            const results = shouldOrderBeProcessed(transaction);

            expect(results).to.be.false;
          });
        }
      }
    });
  });
})
;
