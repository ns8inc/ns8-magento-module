import * as Shopify from 'shopify-api-node';

const getOrder = async (shopifyClient: Shopify, orderId: number): Promise<Shopify.IOrder | Error> => (
  await shopifyClient.order.get(
    orderId,
    { fields: 'financial_status' },
  ).catch((error) => new Error(`Could not fetch order. ${JSON.stringify(error)}`)));

const createCaptureTransaction = async (shopifyClient: Shopify, orderId: number): Promise<string | Error> => {
  const paymentCaptureResults: Shopify.ITransaction | Error =
    await shopifyClient.transaction.create(orderId, { kind: 'capture' })
      .catch((error) => new Error(`Could not create capture transaction. ${JSON.stringify(error)}`));

  return paymentCaptureResults instanceof Error ? paymentCaptureResults : 'Payment captured successfully.';
};

const paymentCanBeCaptured = (order: Partial<Shopify.IOrder>): boolean => {
  const { financial_status } = order;

  return financial_status === 'authorized';
};

const capturePayment = async (shopifyClient: Shopify, orderId): Promise<string | Error> => {
  let returnMessage: string | Error;

  const order: Shopify.IOrder | Error = await getOrder(shopifyClient, orderId);

  if (order instanceof Error) {
    returnMessage = order;
  } else if (paymentCanBeCaptured(order)) {
    returnMessage = await createCaptureTransaction(shopifyClient, orderId);
  } else {
    returnMessage = 'Not possible to capture payment on this order.';
  }

  return returnMessage;
};

export { paymentCanBeCaptured };
export default capturePayment;
