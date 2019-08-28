import { expect } from 'chai';
import { OrderFinancialStatus, OrderFulfillmentStatus } from 'shopify-api-node';
import { NamedOrderUpdate, SwitchContext, UpdateOrderStatusActionSwitch } from 'ns8-switchboard-interfaces';
import { InterceptOption, Profile, Status } from 'ns8-protect-models';
import { ShopifyUpdateOrderStatusActionSwitch } from '../../src/';
import { switchContextFromPartial } from '../objectGenerators/Protect';
import { orderFromPartial } from '../objectGenerators/Shopify';

describe('ShopifyUpdateOrderStatusActionSwitch', () => {
  const updateOrderStatus: UpdateOrderStatusActionSwitch = new ShopifyUpdateOrderStatusActionSwitch();
  const switchContext: SwitchContext = switchContextFromPartial({});

  describe('InterceptOption.BEFORE', () => {
    beforeEach(() => {
      switchContext.merchant.profile = new Profile({
        interceptPaymentCapture: InterceptOption.BEFORE,
      });
    });

    it('should update when financial_status is paid', async () => {
      switchContext.data = orderFromPartial({
        financial_status: 'paid',
      });

      const namedOrderUpdate: NamedOrderUpdate = await updateOrderStatus.update(switchContext);

      expect(namedOrderUpdate).to.have.keys(['status', 'platformStatus', 'orderName']);
      expect(namedOrderUpdate.status).to.equal(Status.APPROVED);
    });

    it('should NOT update when financial_status is anything other than paid', async () => {
      const financialStatuses: OrderFinancialStatus[] = [
        'authorized',
        'partially_paid',
        'partially_refunded',
        'pending',
        'refunded',
        'voided',
      ];

      for (const financialStatus in financialStatuses) {
        switchContext.data = orderFromPartial({
          financial_status: financialStatus as OrderFinancialStatus,
        });

        const namedOrderUpdate = await updateOrderStatus.update(switchContext);

        expect(namedOrderUpdate).to.be.undefined;
      }
    });
  });

  describe('InterceptOption.AFTER', () => {
    beforeEach(() => {
      switchContext.merchant.profile = new Profile({
        interceptPaymentCapture: InterceptOption.AFTER,
      });
    });

    it('should update when fulfillment_status is fulfilled', async () => {
      switchContext.data = orderFromPartial({
        fulfillment_status: 'fulfilled',
      });

      const namedOrderUpdate = await updateOrderStatus.update(switchContext);

      expect(namedOrderUpdate).to.have.keys(['status', 'platformStatus', 'orderName']);
      expect(namedOrderUpdate.status).to.equal(Status.APPROVED);
    });

    it('should NOT update when fulfillment_status is anything other than fulfilled', async () => {
      const fulfillmentStatuses: OrderFulfillmentStatus[] = [
        'partial',
        'restocked',
        null,
      ];

      for (const fulfillmentStatus in fulfillmentStatuses) {
        switchContext.data = orderFromPartial({
          fulfillment_status: fulfillmentStatus as OrderFulfillmentStatus,
        });

        const namedOrderUpdate = await updateOrderStatus.update(switchContext);

        expect(namedOrderUpdate).to.be.undefined;
      }
    });
  });

  describe('InterceptOption.NEVER', () => {
    beforeEach(() => {
      switchContext.merchant.profile = new Profile({
        interceptPaymentCapture: InterceptOption.NEVER,
      });
    });

    it('should never update with any combination of financial and fulfillment statuses', async () => {
      const financialStatuses: OrderFinancialStatus[] = [
        'authorized',
        'paid',
        'partially_paid',
        'partially_refunded',
        'pending',
        'refunded',
        'voided',
      ];

      const fulfillmentStatuses: OrderFulfillmentStatus[] = [
        'fulfilled',
        'partial',
        'restocked',
        null,
      ];

      for (const financialStatus in financialStatuses) {
        for (const fulfillmentStatus in fulfillmentStatuses) {
          switchContext.data = orderFromPartial({
            financial_status: financialStatus as OrderFinancialStatus,
            fulfillment_status: fulfillmentStatus as OrderFulfillmentStatus,
          });

          const namedOrderUpdate: NamedOrderUpdate = await updateOrderStatus.update(switchContext);

          expect(namedOrderUpdate).to.be.undefined;
        }
      }
    });
  });

  describe('Order Canceled', () => {
    it('should cancel no matter what if the shopify order is canceled', async () => {
      const financialStatuses: OrderFinancialStatus[] = [
        'authorized',
        'paid',
        'partially_paid',
        'partially_refunded',
        'pending',
        'refunded',
        'voided',
      ];

      const fulfillmentStatuses: OrderFulfillmentStatus[] = [
        'fulfilled',
        'partial',
        'restocked',
        null,
      ];

      for (const interceptOption in InterceptOption) {
        for (const financialStatus in financialStatuses) {
          for (const fulfillmentStatus in fulfillmentStatuses) {
            switchContext.merchant.profile = new Profile({
              interceptPaymentCapture: interceptOption as InterceptOption,
            });
            switchContext.data = orderFromPartial({
              financial_status: financialStatus as OrderFinancialStatus,
              fulfillment_status: fulfillmentStatus as OrderFulfillmentStatus,
              cancelled_at: new Date().toString(),
              cancel_reason: 'fraud',
            });

            const namedOrderUpdate: NamedOrderUpdate = await updateOrderStatus.update(switchContext);

            expect(namedOrderUpdate).to.have.keys(['status', 'platformStatus', 'orderName']);
            expect(namedOrderUpdate.status).to.equal(Status.CANCELLED);
          }
        }
      }
    });
  });
});
