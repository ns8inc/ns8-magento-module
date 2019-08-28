import { expect } from 'chai';
import { ITransaction, TransactionStatus } from 'shopify-api-node';
import { Transaction } from 'ns8-protect-models';
import { mapTransactions } from '../../src';
import { newCreditCardTransaction, transactionFromPartial } from '../objectGenerators/Shopify';

describe('mapTransactions', () => {
  const statuses: TransactionStatus[] = ['error', 'failure', 'pending', 'success', null, undefined];

  for (const status of statuses) {
    it(`should create an array of Transactions from a non-CC transaction if status is ${status}`, () => {
      const transactionList: ITransaction[] = [transactionFromPartial({ status })];

      const results: Transaction[] = mapTransactions(transactionList);

      expect(results).to.be.an('array');
      expect(results.length).to.equal(1);
      expect(results[0]).to.be.an.instanceof(Transaction);
    });

    it(`should create an array of Transactions from a CC transaction if status is ${status}`, () => {
      const transactionList: ITransaction[] = [newCreditCardTransaction(status)];

      const results: Transaction[] = mapTransactions(transactionList);

      expect(results).to.be.an('array');
      expect(results.length).to.equal(1);
      expect(results[0]).to.be.an.instanceof(Transaction);
    });
  }
});
