# Switchboard Integration

1. [Switchboard Integration](#switchboard-integration)
   1. [Events (Protect -> Platform)](#events-protect---platform)
      1. [Install (`onInstallEvent`)](#install-oninstallevent)
      1. [Update Customer Verification Status (`updateCustVerifyStatusEvent`)](#update-customer-verification-status-updatecustverifystatusevent)
      1. [Update EQ8 Score (`updateEQ8ScoreEvent`)](#update-eq8-score-updateeq8scoreevent)
      1. [Update Order Risk (`updateOrderRiskEvent`)](#update-order-risk-updateorderriskevent)
      1. [Update Order Status (`updateOrderStatusEvent`)](#update-order-status-updateorderstatusevent)
   1. [Actions (Platform -> Protect)](#actions-platform---protect)
      1. [Create Order (`createOrderAction`)](#create-order-createorderaction)
      1. [Uninstall (`uninstallAction`)](#uninstall-uninstallaction)
      1. [Update Merchant (`updateMerchantAction`)](#update-merchant-updatemerchantaction)
      1. [Update Order Status (`updateOrderStatusAction`)](#update-order-status-updateorderstatusaction)

The [Protect Platform Integration](https://github.com/ns8inc/protect-platform-integration/blob/master/public/en/platform/protect-platform-integration/switchboards.md) repo has more detailed information on switch composition at a high level. This integration document details how Magento specific logic was applied to the Magento switchboard.

## Events (Protect -> Platform)

Format for the headers below:

### Install (`onInstallEvent`)

The [Install](../../../../switchboard/switches/OnInstallEventStep.ts) event does exist in the Magento platform; but the event fires before the platform service integration has established [OAuth](integration_oauth.md), so [concessions](integration_magento_concessions.md) were made to adapt to this challenge. This step function is defined but executes no logic.

### Update Customer Verification Status (`updateCustVerifyStatusEvent`)

The [Update Customer Verification Status](../../../../switchboard/switches/UpdateCustVerifyStatusEventStep.ts) event is defined but not used by Magento.

### Update EQ8 Score (`updateEQ8ScoreEvent`)

The [Update EQ8 Score](../../../../switchboard/switches/UpdateEQ8ScoreEventStep.ts) event is used to simply return the current version of the Magento order back to Protect. The [Create](#create-order-createorderaction) and [Update](#update-order-status-updateorderstatusevent) already resolve the latest version of the EQ8 score; therefore no extra steps are required here except to ensure that a correctly formed Order object is returned.

### Update Order Risk (`updateOrderRiskEvent`)

The [Update Order Risk event](../../../../switchboard/switches/UpdateOrderRiskEventStep.ts) event is used to simply return the current version of the Magento order back to Protect. The [Create](#create-order-createorderaction) and [Update](#update-order-status-updateorderstatusevent) already resolve the latest version of the EQ8 score; therefore no extra steps are required here except to ensure that a correctly formed Order object is returned.

### Update Order Status (`updateOrderStatusEvent`)

The [Update Order Status](../../../../switchboard/switches/UpdateOrderStatusEventStep.ts) event responds to changes in an Order's EQ8 score and makes the corresponding changes specific to Magento (assuming that Protect Order Rules have been defined for the store).

* If the Protect state change is `Cancelled`, the Order is cancelled on the Magento store.
* If the Protect state change is `Approved`:
  * If the Magento Order was on hold, it is unholded
  * The Magento Order status is set to `NS8 Approved`
* If the Protect state change is `Merchant Review`
  * If the Magento Order was not already on hold, it is holded
  * If the Order status is not already `NS8 Merchant Review`, the status is so set

The [state flow is documented in more detail here](integration_order_state_changes.md).

## Actions (Platform -> Protect)

### Create Order (`createOrderAction`)

The [Create Order](../../../../switchboard/switches/CreateOrderActionStep.ts) action shares the same logic as the [Update Order](../../../../switchboard/switches/UpdateOrderStatusActionStep.ts). The Magento [event observable for Orders](../../../../module/Observer/OrderUpdate.php) does not cleanly distinguish between new vs updated orders, so the step function leverages the same underlying code to evaluate and process either.

This step function is responsible for transforming the emited event data into the NS8 version of the order. To do so, additional API calls back to the Magento API are required to fully populate all of the customer, address, line item, transaction, payment and order data that is missing from the event object. See also the [state flow](integration_order_state_changes.md).

### Uninstall (`uninstallAction`)

The [Uninstall](../../../../switchboard/switches/UninstallActionStep.ts) action is responsible to triggering the uninstall flow.

### Update Merchant (`updateMerchantAction`)

The [Update Merchant](../../../../switchboard/switches/UpdateMerchantActionStep.ts) action is triggered whenever the Magento Store is modified by an admin. Each portion of the merchant object has a different data model and is inconsistent, so we only pay attention to specific types of changes that are most relevant, such as a URL change or an email address change.

### Update Order Status (`updateOrderStatusAction`)

See [Create Order](../../../../switchboard/switches/CreateOrderActionStep.ts).
