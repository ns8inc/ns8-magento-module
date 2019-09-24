"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ns8_protect_models_1 = require("ns8-protect-models");
class CreateOrderActionSwitch {
    async create(switchContext) {
        const order = switchContext.data.order;
        return new ns8_protect_models_1.Order({
            name: `#${order.entity_id}`,
            currency: order.order_currency_code,
            merchantId: switchContext.merchant.id,
            addresses: [],
            session: new ns8_protect_models_1.Session({ id: 'f128fb4b-eeaf-46b7-9b63-1e8364c77470', ip: '69.244.160.51' }),
            platformId: `${order.entity_id}`,
            customer: new ns8_protect_models_1.Customer({
                lastName: order.customer_firstname,
                firstName: order.customer_lastname,
                email: order.customer_email,
                id: `${order.customer_id}`
            }),
            platformCreatedAt: new Date(order.created_at),
            totalPrice: 5.0,
            transactions: [],
            lineItems: [],
            hasGiftCard: false,
            platformStatus: 'Active'
        });
    }
}
exports.CreateOrderActionSwitch = CreateOrderActionSwitch;
//# sourceMappingURL=CreateOrderActionSwitch.js.map