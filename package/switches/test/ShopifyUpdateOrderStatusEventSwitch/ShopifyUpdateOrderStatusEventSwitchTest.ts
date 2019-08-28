import { expect } from 'chai';
import * as sinon from 'sinon';
import { SwitchContext, EventSwitch } from 'ns8-switchboard-interfaces';
import { ShopifyUpdateOrderStatusEventSwitch } from '../../src';
import * as cancel from '../../src/cancelShopifyOrder';
import * as capture from '../../src/capturePayment';
import * as fulfill from '../../src/fulfillOrder';
import { switchContextFromPartial } from '../objectGenerators/Protect.SwitchContext';
import { InterceptOption, Order, Status } from 'ns8-protect-models';

describe('ShopifyUpdateOrderStatusEventSwitch', () => {
  const updateOrderStatusEventSwitch: EventSwitch = new ShopifyUpdateOrderStatusEventSwitch();
  const switchContext: SwitchContext = switchContextFromPartial({
    data: new Order({}),
  });
  let cancelFake;
  let captureFake;
  let fulfillFake;

  describe('Order set to Protect.Status.CANCELLED', () => {
    beforeEach(() => {
      switchContext.data.status = Status.CANCELLED;

      cancelFake = sinon.fake.resolves('order canceled');
      captureFake = sinon.fake.resolves('payment captured');
      fulfillFake = sinon.fake.resolves('order fulfilled');

      sinon.replace(cancel, 'default', cancelFake);
      sinon.replace(capture, 'default', captureFake);
      sinon.replace(fulfill, 'default', fulfillFake);
      sinon.replace(console, 'log', sinon.fake());
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should cancel the shopify order', async () => {
      await updateOrderStatusEventSwitch.handle(switchContext)
        .catch(() => null);
      sinon.restore();

      expect(cancelFake.calledOnce).to.be.true;
    });

    it('should NOT try to capture or fulfill', async () => {
      await updateOrderStatusEventSwitch.handle(switchContext)
        .catch((error) => error);
      sinon.restore();

      expect(captureFake.notCalled).to.be.true;
      expect(fulfillFake.notCalled).to.be.true;
    });
  });

  describe('Order set to Protect.Status.APPROVED', () => {
    beforeEach(() => {
      switchContext.data.status = Status.APPROVED;

      cancelFake = sinon.fake.resolves('order canceled');
      captureFake = sinon.fake.resolves('payment captured');
      fulfillFake = sinon.fake.resolves('order fulfilled');

      sinon.replace(cancel, 'default', cancelFake);
      sinon.replace(capture, 'default', captureFake);
      sinon.replace(fulfill, 'default', fulfillFake);
      sinon.replace(console, 'log', sinon.fake());
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should capture payment if InterceptOption.BEFORE', async () => {
      switchContext.merchant.profile.interceptPaymentCapture = InterceptOption.BEFORE;
      await updateOrderStatusEventSwitch.handle(switchContext)
        .catch((error) => error);
      sinon.restore();

      expect(captureFake.calledOnce).to.be.true;
    });

    it('should NOT try to cancel or fulfill if InterceptOption.BEFORE', async () => {
      switchContext.merchant.profile.interceptPaymentCapture = InterceptOption.BEFORE;
      await updateOrderStatusEventSwitch.handle(switchContext)
        .catch((error) => error);
      sinon.restore();

      expect(cancelFake.notCalled).to.be.true;
      expect(fulfillFake.notCalled).to.be.true;
    });

    it('should fulfill order if InterceptOption.AFTER', async () => {
      switchContext.merchant.profile.interceptPaymentCapture = InterceptOption.AFTER;
      await updateOrderStatusEventSwitch.handle(switchContext)
        .catch((error) => error);
      sinon.restore();

      expect(fulfillFake.calledOnce).to.be.true;
    });

    it('should NOT try to cancel or capture if InterceptOption.AFTER', async () => {
      switchContext.merchant.profile.interceptPaymentCapture = InterceptOption.AFTER;
      await updateOrderStatusEventSwitch.handle(switchContext)
        .catch((error) => error);
      sinon.restore();

      expect(cancelFake.notCalled).to.be.true;
      expect(captureFake.notCalled).to.be.true;
    });

    it('should NOT try to fulfill or capture if InterceptOption.NEVER', async () => {
      switchContext.merchant.profile.interceptPaymentCapture = InterceptOption.NEVER;
      await updateOrderStatusEventSwitch.handle(switchContext)
        .catch((error) => error);
      sinon.restore();

      expect(fulfillFake.notCalled).to.be.true;
      expect(captureFake.notCalled).to.be.true;
    });
  });

  describe('Order set to Protect.Status.MERCHANT_REVIEW', () => {
    beforeEach(() => {
      switchContext.data.status = Status.MERCHANT_REVIEW;

      cancelFake = sinon.fake.resolves('order canceled');
      captureFake = sinon.fake.resolves('payment captured');
      fulfillFake = sinon.fake.resolves('order fulfilled');

      sinon.replace(cancel, 'default', cancelFake);
      sinon.replace(capture, 'default', captureFake);
      sinon.replace(fulfill, 'default', fulfillFake);
      sinon.replace(console, 'log', sinon.fake());
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should NOT cancel, capture or fulfill', async () => {
      await updateOrderStatusEventSwitch.handle(switchContext)
        .catch(() => null);
      sinon.restore();

      expect(cancelFake.notCalled).to.be.true;
      expect(captureFake.notCalled).to.be.true;
      expect(fulfillFake.notCalled).to.be.true;
    });
  });
});
