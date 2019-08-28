import * as Shopify from 'shopify-api-node';

const getOrder = async (shopifyClient: Shopify, orderId: number): Promise<Shopify.IOrder | Error> => (
  await shopifyClient.order.get(
    orderId,
    { fields: 'id,total_price_set,financial_status,fulfillments,fulfillment_status' },
  ).catch((error) => new Error(`Could not fetch order. ${JSON.stringify(error)}`)));

const getTransactions = async (shopifyClient: Shopify, orderId: number): Promise<Shopify.ITransaction[] | Error> => (
  await shopifyClient.transaction.list(
    orderId,
    { fields: 'order_id,authorization,kind' },
  ).catch((error) => new Error(`Could not fetch transaction list. ${JSON.stringify(error)}`)));

const voidTransaction =
  async (shopifyClient: Shopify, transaction: Shopify.ITransaction): Promise<Shopify.ITransaction | Error> => {
    const {
      authorization,
      order_id,
    } = transaction;

    return await shopifyClient.transaction.create(order_id, { authorization, kind: 'void' })
      .catch((error) => new Error(`Unable to void transaction. ${JSON.stringify(error)}`));
  };

const orderCanBeCanceled = (order: Shopify.IOrder): boolean => {
  const {
    financial_status,
    fulfillments,
    fulfillment_status,
  } = order;

  return (
    (fulfillments && fulfillments.length === 0)
    && fulfillment_status === null
    && financial_status !== 'partially_paid'
    && financial_status !== 'partially_refunded');
};

const cancelFullyPaidOrder =
  async (shopifyClient: Shopify, order: Shopify.IOrder, email: boolean = false): Promise<string | Error> => {
    const {
      id,
      total_price_set: {
        presentment_money: {
          amount,
          currency_code: currency,
        },
      },
    } = order;

    const params = {
      amount,
      currency,
      email,
      restock: true,
      reason: 'fraud',
    };

    const results = await shopifyClient.order.cancel(id, { ...params })
      .catch((error) => new Error(`Unable to cancel fully paid order. ${JSON.stringify(error)}`));

    return results instanceof Error ? results : 'Paid order refunded and canceled.';
  };

const cancelRefundedOrder =
  async (shopifyClient: Shopify, orderId: number, email: boolean = false): Promise<string | Error> => {
    const results = await shopifyClient.order.cancel(orderId, { email, restock: true, reason: 'fraud' })
      .catch((error) => new Error(`Unable to cancel refunded order. ${JSON.stringify(error)}`));

    return results instanceof Error ? results : 'Refunded order canceled.';
  };

const cancelUnpaidOrder =
  async (shopifyClient: Shopify, orderId: number, email: boolean = false): Promise<Shopify.IOrder | Error> => (
    await shopifyClient.order.cancel(orderId, { email, restock: true, reason: 'fraud' })
      .catch((error) => new Error(`Unable to cancel unpaid order. ${JSON.stringify(error)}`)));

const voidAuthorizedOrder =
  async (shopifyClient: Shopify, order: Shopify.IOrder, email: boolean = false): Promise<string | Error> => {
    let returnMessage: string | Error;
    let voidTransactionResults: Shopify.ITransaction | Error;
    let cancelOrderResults: Shopify.IOrder | Error;

    const { id } = order;
    const transactions: Shopify.ITransaction[] | Error = await getTransactions(shopifyClient, id);

    if (transactions instanceof Error) {
      return transactions;
    }

    const transaction: Shopify.ITransaction | null =
      transactions.find((transaction) => transaction.kind === 'authorization');

    if (transaction) {
      voidTransactionResults = await voidTransaction(shopifyClient, transaction);

      if (voidTransactionResults instanceof Error) {
        returnMessage = voidTransactionResults;
      } else {
        returnMessage = `Transaction voided successfully ${JSON.stringify(voidTransactionResults)}`;
      }
    } else {
      returnMessage = 'No authorization transaction was found.';
    }

    cancelOrderResults = await cancelUnpaidOrder(shopifyClient, id, email);

    if (cancelOrderResults instanceof Error) {
      returnMessage = `${returnMessage} --- ${cancelOrderResults}`;
    } else {
      returnMessage = `${returnMessage} --- Order canceled successfully ${JSON.stringify(cancelOrderResults)}`;
    }

    return returnMessage;
  };

const cancelShopifyOrder =
  async (shopifyClient: Shopify, orderId: number, emailOnCancel: boolean = false): Promise<string | Error> => {
    let returnMessage: string | Error;

    const order: Shopify.IOrder | Error = await getOrder(shopifyClient, orderId);

    if (order instanceof Error) {
      return order;
    }

    if (orderCanBeCanceled(order)) {
      const { financial_status } = order;

      if (financial_status === 'paid') {
        returnMessage = await cancelFullyPaidOrder(shopifyClient, order, emailOnCancel);
      } else if (financial_status === 'refunded') {
        returnMessage = await cancelRefundedOrder(shopifyClient, orderId, emailOnCancel);
      } else {
        returnMessage = await voidAuthorizedOrder(shopifyClient, order, emailOnCancel);
      }
    } else {
      returnMessage = 'Order is in a noncancelable state.';
    }

    return returnMessage;
  };

export { orderCanBeCanceled };
export default cancelShopifyOrder;
