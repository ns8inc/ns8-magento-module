import { LineItem } from 'ns8-protect-models';
import { MagentoClient, error } from '.';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';

/**
 * Utlity method for converting Magento Items to Protect Line Items
 */
export class LineItemsHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: MagentoOrder;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient, magentoOrder: MagentoOrder) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = magentoOrder;
  }

  /**
   * Converts Items to Line Items.
   * NOTE: a number of Protect model concepts do not exist in Magento by default. These are commented out below.
   * TODO: investigate whether and how Magento users are adding the missing data and how we might retrieve it.
   */
  public toLineItems = (): LineItem[] => {
    const ret: LineItem[] = [];

    try {
      this.MagentoOrder.items.forEach((item) => {
        //NOTE: Protect will throw inscrutable exceptions if `''` is provided instead of null.
        //Leave the missing properties commented out to be more explicit that we don't yet know how to get this data.
        const i = new LineItem({
          //ean13: '',
          isGiftCard: false,
          //isbn: '',
          //manufacturer: '',
          name: item.name,
          platformId: `${item.item_id}`,
          platformProductId: `${item.product_id}`,
          price: item.price,
          quantity: item.qty_ordered,
          sku: item.sku,
          title: item.description,
          totalDiscount: item.discount_amount,
          //upc: '',
          //variantId: '',
          //variantTitle: '',
          //vendor: ''
        });
        ret.push(i);
      });
    } catch (e) {
      error(`Failed to create Line Items`, e);
    }
    return ret;
  }

}
