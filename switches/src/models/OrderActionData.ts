export interface OrderActionModel {
  applied_rule_ids: string;
  base_currency_code: string;
  base_discount_amount: string;
  base_discount_canceled: string;
  base_discount_tax_compensation_amount: string;
  base_grand_total: string;
  base_shipping_amount: string;
  base_shipping_canceled: string;
  base_shipping_discount_amount: string;
  base_shipping_discount_tax_compensation_amnt: string;
  base_shipping_incl_tax: string;
  base_shipping_tax_amount: string;
  base_subtotal_canceled: string;
  base_subtotal_incl_tax: string;
  base_subtotal: string;
  base_tax_amount: string;
  base_tax_canceled: string;
  base_to_global_rate: string;
  base_to_order_rate: string;
  base_total_canceled: string;
  base_total_due: string;
  billing_address_id: string;
  created_at: string;
  customer_dob: string;
  customer_email: string;
  customer_firstname: string;
  customer_gender: string;
  customer_group_id: string;
  customer_id: string;
  customer_is_guest: string;
  customer_lastname: string;
  customer_note_notify: string;
  discount_amount: string;
  discount_canceled: string;
  discount_tax_compensation_amount: string;
  email_sent: string;
  entity_id: string;
  global_currency_code: string;
  grand_total: string;
  increment_id: string;
  is_virtual: string;
  order_currency_code: string;
  paypal_ipn_customer_notified: string;
  protect_code: string;
  quote_id: string;
  send_email: string;
  shipping_address_id: string;
  shipping_amount: string;
  shipping_canceled: string;
  shipping_description: string;
  shipping_discount_amount: string;
  shipping_discount_tax_compensation_amount: string;
  shipping_incl_tax: string;
  shipping_method: string;
  shipping_tax_amount: string;
  state: string;
  status: string;
  store_currency_code: string;
  store_id: string;
  store_name: string;
  store_to_base_rate: string;
  store_to_order_rate: string;
  subtotal_canceled: string;
  subtotal_incl_tax: string;
  subtotal: string;
  tax_amount: string;
  tax_canceled: string;
  total_canceled: string;
  total_due: string;
  total_item_count: string;
  total_qty_ordered: string;
  updated_at: string;
  weight: string;
}

/**
 * This model represents the data that Magento sends to Protect as a response to any observable Order action (Order Create, Order Cancel, etc).
 * This is a flattened representation of the order, with no defined external relationships; and this model is not exposed through any Magento API.
 * One critical item of note here is the `increment_id` property. This model is the **most** reliable place to access this property.
 * In some other cases, unless explicitly included, the `increment_id` will not consistently be present.
 * The distinction between `entity_id` and `increment_id` is documented elsewhere.
 */
export interface OrderActionData {
  order: OrderActionModel;
}
