import { EventSwitch, SwitchContext } from 'ns8-switchboard-interfaces';
import getShopifyClient from './getShopifyClient';
import * as Shopify from 'shopify-api-node';

export class ShopifyInstallEventSwitch implements EventSwitch {
  handle = async (switchContext: SwitchContext): Promise<any> => {
    const { actions }: { actions: any } = switchContext.data;

    const createOrderEndpoint: URL = switchContext.createWebhookUrl(actions.CREATE_ORDER);
    const updateMerchantEndpoint: URL = switchContext.createWebhookUrl(actions.UPDATE_MERCHANT);
    const orderStatusUpdateEndpoint: URL = switchContext.createWebhookUrl(actions.UPDATE_ORDER_STATUS);
    const uninstallEndpoint: URL = switchContext.createWebhookUrl(actions.UNINSTALL);

    const trackingScriptEndpoint: URL = switchContext.createTrackingUrl();

    const client: Shopify = getShopifyClient(switchContext);

    const pendingDeletions = [];
    const pendingInstallations = [];

    // get the lists of existing webhooks and script tags and delete them
    await Promise.all([client.webhook.list(), client.scriptTag.list()])
      .then((values) =>  {
        const [webhookList, scriptTagList] = values;

        webhookList.forEach((webhook) => {
          pendingDeletions.push(client.webhook.delete(webhook.id));
        });

        scriptTagList.forEach((scriptTag) => {
          pendingDeletions.push(client.scriptTag.delete(scriptTag.id));
        });

        pendingDeletions.push(true);
      });

    // Wait for all of the cleanup deletions to finish
    await Promise.all(pendingDeletions);

    // Install our analytics script onto the shop
    pendingInstallations.push(client.scriptTag.create({
      src: trackingScriptEndpoint.toString(),
      event: 'onload',
      display_scope: 'all',
    }));

    // Create a Protect order when a Shopify order is created
    pendingInstallations.push(client.webhook.create({
      topic: 'order_transactions/create',
      address: createOrderEndpoint.toString(),
    }));

    // Capture changes to shop settings
    pendingInstallations.push(client.webhook.create({
      topic: 'shop/update',
      address: updateMerchantEndpoint.toString(),
    }));

    // When Shopify cancels an order, update the Protect status
    pendingInstallations.push(client.webhook.create({
      topic: 'orders/cancelled',
      address: orderStatusUpdateEndpoint.toString(),
    }));

    // When Shopify marks an order paid, update the Protect status
    pendingInstallations.push(client.webhook.create({
      topic: 'orders/paid',
      address: orderStatusUpdateEndpoint.toString(),
    }));

    // When Shopify marks an order fulfilled, update the Protect status
    pendingInstallations.push(client.webhook.create({
      topic: 'orders/fulfilled',
      address: orderStatusUpdateEndpoint.toString(),
    }));

    // Cleanup and removal upon uninstall
    pendingInstallations.push(client.webhook.create({
      topic: 'app/uninstalled',
      address: uninstallEndpoint.toString(),
    }));

    return await Promise.all(pendingInstallations);
  }
}
