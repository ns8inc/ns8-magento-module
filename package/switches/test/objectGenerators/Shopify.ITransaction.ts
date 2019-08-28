import {
  IPaymentDetails,
  ITransaction,
  TransactionStatus,
  TransactionKind,
} from 'shopify-api-node';

const paymentDetails: IPaymentDetails = {
  avs_result_code: null,
  credit_card_bin: '1',
  credit_card_company: 'Bogus',
  credit_card_number: '•••• •••• •••• 1',
  cvv_result_code: null,
};

const transactionObject: ITransaction = {
  amount: '1.00',
  authorization: null,
  created_at: null,
  currency: 'USD',
  currency_exchange_adjustment: null,
  device_id: null,
  error_code: null,
  gateway: null,
  id: 1,
  kind: null,
  location_id: null,
  message: 'test transaction',
  order_id: 1,
  payment_details: null,
  parent_id: null,
  processed_at: null,
  receipt: null,
  source_name: 'web',
  status: null,
  test: true,
  user_id: 1,
};

const transactionFromPartial = (transactionPartial: Partial<ITransaction> = {}): ITransaction => (
  { ...transactionObject, ...transactionPartial }
);

const paymentDetailsFromPartial = (paymentDetailsPartial: Partial<IPaymentDetails> = {}): IPaymentDetails => (
  { ...paymentDetails, ...paymentDetailsPartial }
);

const newCreditCardTransaction =
  (status: TransactionStatus = 'success', kind: TransactionKind = 'authorization'): ITransaction => {
    const randomId = Math.floor(Math.random() * 1000000);

    const transactionPartial: Partial<ITransaction> = {
      status,
      kind,
      id: randomId,
      authorization: '1234',
      gateway: 'bogus',
      payment_details: paymentDetails,
    };

    return { ...transactionObject, ...transactionPartial };
  };

const newNonCreditCardTransaction =
  (gateway: string, status: TransactionStatus = 'pending', kind: TransactionKind = 'sale'): ITransaction => {
    const randomId = Math.floor(Math.random() * 1000000);

    const transactionPartial: Partial<ITransaction> = {
      status,
      gateway,
      kind,
      id: randomId,
    };

    return { ...transactionObject, ...transactionPartial };
  };

export {
  newCreditCardTransaction,
  newNonCreditCardTransaction,
  paymentDetailsFromPartial,
  transactionFromPartial,
};
