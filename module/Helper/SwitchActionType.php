<?php
namespace NS8\Protect\Helper;

/**
 * Defines the Switch Action Types which we'll call from Magento
 */
class SwitchActionType
{
    /**
     * Canonical Step Name for Create Order
     */
    const CREATE_ORDER_ACTION = 'CREATE_ORDER_ACTION';

    /**
     * Canonical Step Name for Update Order
     */
    const UPDATE_ORDER_STATUS_ACTION = 'UPDATE_ORDER_STATUS_ACTION';

    /**
     * Canonical Step Name for Update Merchant
     */
    const UPDATE_MERCHANT_ACTION = 'UPDATE_MERCHANT_ACTION';

    /**
     * Canonical Step Name for Uninstall
     */
    const UNINSTALL_ACTION = 'UNINSTALL_ACTION';

}
