# Order State Change

1. [Order State Change](#order-state-change)
   1. [Standard Flow](#standard-flow)
   1. [Exceptions](#exceptions)

Magento orders follow a fairly simple state flow from one state into the next, though caveats and conditions apply.

## Standard Flow

Magento stores state information in two different places on a Order object, in the `state` and the `status` properties. Developers can add to the available states and statuses, but for the present concern, we only consider the default options for the `state` property. In a typical flow, and order state could follow these state changes in a journey to completion:

* Pending > Processing > Complete

As long as orders are cancellable, additional state changes are possible. A cancellable order is an order whose state is not `complete`, `closed` or `canceled`. If the order is cancellable, then the order's state can be changed to `holded`, `processing`, `canceled`, `closed`, `complete` or any other custom state.

When Order Rules are defined in Protect, the following state changes will occur.

* If the Protect recommendation is Approved, the Magento order state is set to `processing` and the order status is set to `NS8 Approved`.
* If the Protect recommendation is Canceled, the Magento order is canceled.
* If the Protect recommendation is Merchant Review, the Magento order state is set to `holded` and the hold function is called for that Order in Magento and the order status is set to `NS8 Merchant Review`.

## Exceptions

Credit Card (CC) orders behave differently from other orders in two significant ways (see also [concessions](integration_magento_concessions.md)). First, when a new CC order is created, the Magento observable event triggers an order update event and not an order create event. In order to identify a "new" CC order, significant work had to be done to allow introspecting the order object to determine newness. Second, when a new CC order is created, its state is not the initial `pending` state but `processing`.
