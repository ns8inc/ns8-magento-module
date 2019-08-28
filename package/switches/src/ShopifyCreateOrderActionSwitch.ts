import { CreateOrderActionSwitch, SwitchContext } from 'ns8-switchboard-interfaces';
import {
  Address,
  AddressType,
  CreditCard,
  CreditCardTransactionType,
  Customer,
  LineItem,
  Order,
  Session,
  Transaction,
  TransactionMethod,
  TransactionStatus,
} from 'ns8-protect-models';
import * as Shopify from 'shopify-api-node';
import {
  parsePhoneNumberFromString,
  CountryCode,
  PhoneNumber,
} from 'libphonenumber-js';
import getShopifyClient from './getShopifyClient';

const formatPhoneNumber = (phoneNumberString: string, countryCode?: string): string | undefined => {
  let phoneNumber: PhoneNumber | undefined;
  let e164PhoneNumberString: string;

  try {
    phoneNumber = parsePhoneNumberFromString(phoneNumberString, countryCode as CountryCode);
  } catch (error) {
    console.log('Could not format phone number: ', error.toString());
  }

  if (phoneNumber && phoneNumber.number) {
    e164PhoneNumberString = phoneNumber.format('E.164');
  }

  return e164PhoneNumberString;
};

const mapCustomer = (customer: Shopify.IOrderCustomer, billingAddress: Shopify.ICustomerAddress): Customer => {
  const {
    id,
    first_name = '',
    last_name = '',
    email,
    total_spent,
    created_at,
    default_address,
  } = customer;

  let phone: string;

  if (customer.phone) {
    phone = formatPhoneNumber(customer.phone);
  }

  if (!phone && default_address && default_address.phone) {
    phone = formatPhoneNumber(default_address.phone, default_address.country_code);
  }

  if (!phone && billingAddress && billingAddress.phone) {
    phone = formatPhoneNumber(billingAddress.phone, billingAddress.country_code);
  }

  return new Customer({
    email,
    phone,
    platformId: id.toString(),
    firstName: first_name || default_address.first_name,
    lastName: last_name || default_address.last_name,
    totalSpent: isNaN(parseFloat(total_spent)) ? undefined : parseFloat(total_spent),
    platformCreatedAt: new Date(created_at),
  });
};

const mapAddress = (address: Shopify.ICustomerAddress, type: string): Address => {
  const {
    name,
    company,
    address1,
    address2,
    city,
    zip,
    province,
    province_code,
    country,
    country_code,
    latitude,
    longitude,
  } = address;

  return new Address({
    name,
    company,
    address1,
    address2,
    city,
    zip,
    country,
    type: AddressType[type],
    region: province,
    regionCode: province_code,
    countryCode: country_code,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  });
};

const mapLineItems = (lineItems: Shopify.IOrderLineItem[]): LineItem[] => {
  return (lineItems.map((lineItem): LineItem => {
    const {
      title,
      name,
      quantity,
      price,
      sku,
      variant_id,
      variant_title,
      vendor,
      product_id,
      gift_card,
      total_discount,
    }: {
      title: string,
      name: string,
      quantity: number,
      price: string,
      sku: string,
      variant_id: number | null,
      variant_title: string,
      vendor: string,
      product_id: number | null,
      gift_card: boolean,
      total_discount: string,
    } = lineItem;

    return new LineItem({
      title,
      name,
      quantity,
      sku,
      vendor,
      price: parseFloat(price),
      variantId: variant_id ? variant_id.toString() : '',
      variantTitle: variant_title,
      platformProductId: product_id ? product_id.toString() : '',
      isGiftCard: gift_card,
      totalDiscount: parseFloat(total_discount),
    });
  }));
};

const hasGiftCard = (lineItems: Shopify.IOrderLineItem[]): boolean => (
  lineItems.some((item) => item.gift_card)
);

const mapCreditCard =
  (paymentDetails: Shopify.IPaymentDetails, kind: Shopify.TransactionKind, gateway: string): CreditCard => {
    const {
      avs_result_code,
      credit_card_bin,
      credit_card_company,
      credit_card_number,
      cvv_result_code,
    }: {
      avs_result_code: string | null,
      credit_card_bin: string | null,
      credit_card_company: string,
      credit_card_number: string,
      cvv_result_code: string | null,
    } = paymentDetails;

    return new CreditCard({
      gateway,
      transactionType: kind ? CreditCardTransactionType[kind.toUpperCase()] : undefined,
      creditCardNumber: credit_card_number ? credit_card_number.split(' ').pop() : undefined,
      creditCardCompany: credit_card_company,
      avsResultCode: avs_result_code,
      cvvResultCode: cvv_result_code,
      creditCardBin: credit_card_bin,
    });
  };

const mapTransactions = (transactionList: Shopify.ITransaction[]): Transaction[] => (
  transactionList.map((transaction: Shopify.ITransaction): Transaction => {
    const {
      id,
      amount,
      currency,
      kind,
      gateway,
      status,
      message,
      payment_details,
      processed_at,
    }: {
      id: number,
      amount: string,
      currency: string,
      kind: Shopify.TransactionKind,
      gateway: string,
      status: Shopify.TransactionStatus,
      message: string,
      payment_details: Shopify.IPaymentDetails,
      processed_at: string,
    } = transaction;

    if (!status) {
      console.log(`transaction status missing: ${JSON.stringify(transaction)}`);
    }

    const transactionPartial: Partial<Transaction> = {
      currency,
      platformId: id ? id.toString() : undefined,
      method: TransactionMethod.CC,
      amount: parseFloat(amount),
      status: status ? TransactionStatus[status.toUpperCase()] : undefined,
      statusDetails: message,
      processedAt: new Date(processed_at),
    };

    if (payment_details) {
      transactionPartial.method = TransactionMethod.CC;
      transactionPartial.creditCard = mapCreditCard(payment_details, kind, gateway);
    } else {
      if (gateway === 'Money Order') {
        transactionPartial.method = TransactionMethod.CHECK;
      } else if (gateway === 'Bank Deposit') {
        transactionPartial.method = TransactionMethod.BANK_WIRE;
      } else if (gateway === 'Cash on Delivery (COD)') {
        transactionPartial.method = TransactionMethod.COD;
      } else {
        transactionPartial.method = TransactionMethod.OTHER;
      }
    }

    return new Transaction(transactionPartial);
  })
);

const makeTestClientDetails = (): Shopify.IOrderClientDetails => ({
  accept_language: 'en-us',
  browser_height: null,
  browser_ip: '23.117.48.221',
  browser_width: null,
  session_hash: null,
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) ' +
    'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15',
});

const parseDemoNoteAttributes = (noteAttributes: Shopify.IOrderLineItemNote[] = []): Shopify.IOrderClientDetails => {
  const ip = noteAttributes
    .filter((note) => note.name === 'ip')
    .map((note) => note.value)
    .join();

  const userAgent = noteAttributes
    .filter((note) => note.name === 'ua')
    .map((note) => note.value)
    .join();

  const acceptLanguage = noteAttributes
    .filter((note) => note.name === 'accept_language')
    .map((note) => note.value)
    .join();

  return {
    accept_language: acceptLanguage,
    browser_height: null,
    browser_ip: ip,
    browser_width: null,
    session_hash: null,
    user_agent: userAgent,
  };
};

const mapSession = (clientDetails: Shopify.IOrderClientDetails): Session => {
  const {
    accept_language,
    browser_ip,
    user_agent,
  } = clientDetails;

  return new Session({
    ip: browser_ip,
    userAgent: user_agent,
    acceptLanguage: accept_language,
  });
};

const getClientDetails = (order: Shopify.IOrder): Shopify.IOrderClientDetails | Error => {
  const minimumIpAddressLength = 7;
  const {
    client_details,
    note_attributes,
    source_name,
    test,
  } = order;

  let clientDetails: Shopify.IOrderClientDetails | Error;

  if (source_name === 'demo' && (!client_details || Object.keys(client_details).length === 0)) {
    // Generated golfer gifts demo orders need to have their client data parsed from the note_attributes
    clientDetails = parseDemoNoteAttributes(note_attributes);
  } else if (test && (!client_details || Object.keys(client_details).length === 0)) {
    // If it's a test order and there are no session details, then fill in with dummy session data.
    clientDetails = makeTestClientDetails();
  } else if (client_details && Object.keys(client_details).length > 0) {
    // Only proceed with creating the order if the client_details exist.
    clientDetails = client_details;
  } else {
    clientDetails = new Error(`Client details cannot be derived from this order.`);
  }

  if (!(clientDetails instanceof Error)) {
    if (!clientDetails.browser_ip || clientDetails.browser_ip.length < minimumIpAddressLength) {
      clientDetails = new Error('Invalid Client Details object: IP Address.');
    }
  }

  if (clientDetails instanceof Error) {
    clientDetails.message = `${clientDetails.message} ${JSON.stringify(order)}`;
  }

  return clientDetails;
};

const shouldOrderBeProcessed = (transaction: Shopify.ITransaction): boolean => {
  const {
    kind,
    payment_details,
    status,
    source_name,
  }: {
    kind: Shopify.TransactionKind,
    payment_details: Shopify.IPaymentDetails,
    status: Shopify.TransactionStatus,
    source_name: Shopify.TransactionSourceName,
  } = transaction;

  let shouldProcessOrder: boolean = false;

  // Non-credit-card transactions and 3rd party credit card processors (paypal, amazon pay, etc) without payment_details
  if (!payment_details &&
    kind !== 'void' && kind !== 'refund' && kind !== 'capture' &&
    (status === 'pending' || status === 'success')) {
    shouldProcessOrder = true;
  }

  // Credit card transactions
  if (payment_details && status === 'success' && (kind === 'sale' || kind === 'authorization')) {
    shouldProcessOrder = true;
  }

  // Skip all Point-of-Sale transactions
  if (source_name === 'pos') {
    shouldProcessOrder = false;
  }

  return shouldProcessOrder;
};

export class ShopifyCreateOrderActionSwitch implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {
    const { order_id }: { order_id: number } = switchContext.data;

    console.log(switchContext.merchant.domain, order_id);

    if (shouldOrderBeProcessed(switchContext.data)) {
      const client: Shopify = getShopifyClient(switchContext);
      const shopifyOrder: Shopify.IOrder = await client.order.get(order_id);
      const shopifyTransactionList: Shopify.ITransaction[] = await client.transaction.list(order_id);
      const { id: merchantId }: { id: string } = switchContext.merchant;
      const addresses: Address[] = [];
      const clientDetails = getClientDetails(shopifyOrder);
      const {
        id,
        name,
        currency,
        billing_address,
        shipping_address,
        customer,
        total_price,
        line_items = [],
        created_at,
      } = shopifyOrder;

      // Temporary logging to better understand transaction shapes.
      if (switchContext.data.kind === 'capture' &&
        shopifyTransactionList.every((transaction) => transaction.kind !== 'authorization')) {
        console.log('capture without authorization', JSON.stringify({
          orderId: id,
          orderName: name,
          domain: switchContext.merchant.domain,
          contextData: switchContext.data,
          transactions: shopifyTransactionList,
        }));
      }

      if (clientDetails instanceof Error) {
        console.log(clientDetails);
      } else {
        const session: Session = mapSession(clientDetails);

        if (billing_address) {
          addresses.push(mapAddress(billing_address, 'BILLING'));
        }

        if (shipping_address) {
          addresses.push(mapAddress(shipping_address, 'SHIPPING'));
        }

        let protectCustomer: Customer;

        if (customer) {
          protectCustomer = mapCustomer(customer, billing_address);
        }

        return new Order({
          name,
          currency,
          merchantId,
          addresses,
          session,
          platformId: id.toString(),
          customer: protectCustomer,
          platformCreatedAt: new Date(created_at),
          totalPrice: parseFloat(total_price),
          transactions: mapTransactions(shopifyTransactionList),
          lineItems: mapLineItems(line_items),
          hasGiftCard: hasGiftCard(line_items),
          platformStatus: 'Active',
        });
      }
    } else {
      console.log('Order transaction not qualified to create a new order. ' +
        `Domain: ${switchContext.merchant.domain} ` +
        `Shopify Order ID: ${order_id}`);
    }
  }
}

export {
  formatPhoneNumber,
  getClientDetails,
  makeTestClientDetails,
  mapCreditCard,
  mapCustomer,
  mapLineItems,
  mapTransactions,
  parseDemoNoteAttributes,
  shouldOrderBeProcessed,
};
