import { LineItem } from 'ns8-protect-models';
import { MagentoClient } from '.';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';
export class LineItemsHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: MagentoOrder;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient, magentoOrder: MagentoOrder) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = magentoOrder;
  }

  public toLineItems = (): LineItem[] => {
    const ret: LineItem[] = [];

    this.MagentoOrder.items.forEach((item) => {
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

    return ret;
  }

}
