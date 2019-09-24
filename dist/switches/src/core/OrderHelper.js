"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ns8_protect_models_1 = require("ns8-protect-models");
const libphonenumber_js_1 = require("libphonenumber-js");
const formatPhoneNumber = (phoneNumberString, countryCode) => {
    let phoneNumber;
    let e164PhoneNumberString;
    try {
        phoneNumber = libphonenumber_js_1.parsePhoneNumberFromString(phoneNumberString, countryCode);
    }
    catch (error) {
        console.log('Could not format phone number: ', error.toString());
    }
    if (phoneNumber && phoneNumber.number) {
        e164PhoneNumberString = phoneNumber.format('E.164');
    }
    return e164PhoneNumberString;
};
exports.formatPhoneNumber = formatPhoneNumber;
const mapCustomer = (customer, billingAddress) => {
    const { id, first_name = '', last_name = '', email, total_spent, created_at, default_address, } = customer;
    let phone;
    if (customer.phone) {
        phone = formatPhoneNumber(customer.phone);
    }
    if (!phone && default_address && default_address.phone) {
        phone = formatPhoneNumber(default_address.phone, default_address.country_code);
    }
    if (!phone && billingAddress && billingAddress.phone) {
        phone = formatPhoneNumber(billingAddress.phone, billingAddress.country_code);
    }
    return new ns8_protect_models_1.Customer({
        email,
        phone,
        platformId: id.toString(),
        firstName: first_name || default_address.first_name,
        lastName: last_name || default_address.last_name,
        totalSpent: isNaN(parseFloat(total_spent)) ? undefined : parseFloat(total_spent),
        platformCreatedAt: new Date(created_at),
    });
};
exports.mapCustomer = mapCustomer;
const mapAddress = (address, type) => {
    const { name, company, address1, address2, city, zip, province, province_code, country, country_code, latitude, longitude, } = address;
    return new ns8_protect_models_1.Address({
        name,
        company,
        address1,
        address2,
        city,
        zip,
        country,
        type: ns8_protect_models_1.AddressType[type],
        region: province,
        regionCode: province_code,
        countryCode: country_code,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
    });
};
const mapLineItems = (lineItems) => {
    return (lineItems.map((lineItem) => {
        const { title, name, quantity, price, sku, variant_id, variant_title, vendor, product_id, gift_card, total_discount, } = lineItem;
        return new ns8_protect_models_1.LineItem({
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
exports.mapLineItems = mapLineItems;
const hasGiftCard = (lineItems) => (lineItems.some((item) => item.gift_card));
const mapCreditCard = (paymentDetails, kind, gateway) => {
    const { avs_result_code, credit_card_bin, credit_card_company, credit_card_number, cvv_result_code, } = paymentDetails;
    return new ns8_protect_models_1.CreditCard({
        gateway,
        transactionType: ns8_protect_models_1.CreditCardTransactionType[kind.toUpperCase()],
        creditCardNumber: credit_card_number ? credit_card_number.split(' ').pop() : undefined,
        creditCardCompany: credit_card_company,
        avsResultCode: avs_result_code,
        cvvResultCode: cvv_result_code,
        creditCardBin: credit_card_bin,
    });
};
exports.mapCreditCard = mapCreditCard;
const mapTransactions = (transactionList) => (transactionList.map((transaction) => {
    const { id, amount, currency, kind, gateway, status, message, payment_details, processed_at, } = transaction;
    if (!status) {
        console.log(`transaction status missing: ${JSON.stringify(transaction)}`);
    }
    const transactionPartial = {
        currency,
        platformId: id ? id.toString() : undefined,
        method: ns8_protect_models_1.TransactionMethod.CC,
        amount: parseFloat(amount),
        status: status ? ns8_protect_models_1.TransactionStatus[status.toUpperCase()] : undefined,
        statusDetails: message,
        processedAt: new Date(processed_at),
    };
    if (payment_details) {
        transactionPartial.method = ns8_protect_models_1.TransactionMethod.CC;
        transactionPartial.creditCard = mapCreditCard(payment_details, kind, gateway);
    }
    else {
        if (gateway === 'Money Order') {
            transactionPartial.method = ns8_protect_models_1.TransactionMethod.CHECK;
        }
        else if (gateway === 'Bank Deposit') {
            transactionPartial.method = ns8_protect_models_1.TransactionMethod.BANK_WIRE;
        }
        else if (gateway === 'Cash on Delivery (COD)') {
            transactionPartial.method = ns8_protect_models_1.TransactionMethod.COD;
        }
        else {
            transactionPartial.method = ns8_protect_models_1.TransactionMethod.OTHER;
        }
    }
    return new ns8_protect_models_1.Transaction(transactionPartial);
}));
exports.mapTransactions = mapTransactions;
const makeTestClientDetails = () => ({
    accept_language: 'en-us',
    browser_height: null,
    browser_ip: '23.117.48.221',
    browser_width: null,
    session_hash: null,
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) ' +
        'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15',
});
exports.makeTestClientDetails = makeTestClientDetails;
const parseDemoNoteAttributes = (noteAttributes = []) => {
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
exports.parseDemoNoteAttributes = parseDemoNoteAttributes;
const mapSession = (clientDetails) => {
    const { accept_language, browser_ip, user_agent, } = clientDetails;
    return new ns8_protect_models_1.Session({
        ip: browser_ip,
        userAgent: user_agent,
        acceptLanguage: accept_language,
    });
};
const getClientDetails = (order) => {
    const minimumIpAddressLength = 7;
    const { client_details, note_attributes, source_name, test, } = order;
    let clientDetails = Object;
    if (source_name === 'demo' && (!client_details || Object.keys(client_details).length === 0)) {
        // Generated golfer gifts demo orders need to have their client data parsed from the note_attributes
        clientDetails = parseDemoNoteAttributes(note_attributes);
    }
    else if (test && (!client_details || Object.keys(client_details).length === 0)) {
        // If it's a test order and there are no session details, then fill in with dummy session data.
        clientDetails = makeTestClientDetails();
    }
    else if (client_details && Object.keys(client_details).length > 0) {
        // Only proceed with creating the order if the client_details exist.
        clientDetails = client_details;
    }
    return clientDetails;
};
exports.getClientDetails = getClientDetails;
const shouldOrderBeProcessed = (transaction) => {
    const shouldProcessOrder = false;
    // Non-credit-card transactions and 3rd party credit card processors (paypal, amazon pay, etc) without payment_details
    // if (!payment_details &&
    //     kind !== 'void' && kind !== 'refund' && kind !== 'capture' &&
    //     (status === 'pending' || status === 'success')) {
    //     shouldProcessOrder = true;
    // }
    // Credit card transactions
    // if (payment_details && status === 'success' && (kind === 'sale' || kind === 'authorization')) {
    //     shouldProcessOrder = true;
    // }
    // Skip all Point-of-Sale transactions
    // if (source_name === 'pos') {
    //     shouldProcessOrder = false;
    // }
    return shouldProcessOrder;
};
exports.shouldOrderBeProcessed = shouldOrderBeProcessed;
const processOrder = (switchContext) => {
    const { order_id } = switchContext.data;
    console.log(switchContext.merchant.domain, order_id);
    if (shouldOrderBeProcessed(switchContext.data)) {
        const { id: merchantId } = switchContext.merchant;
        const addresses = [];
        const clientDetails = getClientDetails(switchContext.data);
        const { id, name, currency, billing_address, shipping_address, customer, total_price, line_items = [], created_at, } = switchContext.data;
        const session = mapSession(clientDetails);
        if (billing_address) {
            addresses.push(mapAddress(billing_address, 'BILLING'));
        }
        if (shipping_address) {
            addresses.push(mapAddress(shipping_address, 'SHIPPING'));
        }
        let protectCustomer;
        if (customer) {
            protectCustomer = mapCustomer(customer, billing_address);
        }
        // return new Order({
        //   name,
        //   currency,
        //   merchantId,
        //   addresses,
        //   session,
        //   platformId: id.toString(),
        //   customer: protectCustomer,
        //   platformCreatedAt: new Date(created_at),
        //   totalPrice: parseFloat(total_price),
        //   transactions: mapTransactions(shopifyTransactionList),
        //   lineItems: mapLineItems(line_items),
        //   hasGiftCard: hasGiftCard(line_items),
        //   platformStatus: 'Active',
        // });
    }
};
exports.processOrder = processOrder;
//# sourceMappingURL=OrderHelper.js.map