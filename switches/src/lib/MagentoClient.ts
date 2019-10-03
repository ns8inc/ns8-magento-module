import { SwitchContext } from 'ns8-switchboard-interfaces';
import { RestClient, Order, Customer, Transaction as MagentoTransaction } from '@ns8/magento2-rest-client';
import { ServiceIntegration, Transaction } from 'ns8-protect-models';
import { log } from '.';
export class MagentoClient {

  private SwitchContext: SwitchContext;
  public client: RestClient;
  constructor(switchContext: SwitchContext) {
    try {
      this.SwitchContext = switchContext;
      let siTemp = this.SwitchContext.merchant.serviceIntegrations.find((integration) => {
        return integration.type === 'MAGENTO';
      });
      if (!siTemp) throw new Error('No Magento Service Integration defined on this merchant');
      const si: ServiceIntegration = siTemp;

      this.client = new RestClient({
        url: `${this.SwitchContext.merchant.storefrontUrl}/index.php/rest`,
        consumerKey: si.identityToken,
        consumerSecret: si.identitySecret,
        accessToken: si.token,
        accessTokenSecret: si.secret
      })
    } catch (e) {
      log('Failed to construct RestClient', e);
    }
  }

  public getOrder = async (id: number): Promise<Order | null> => {
    try {
      return await this.client.orders.get(id);
    } catch (e) {
      log(`Failed to get Order Id:${id} from Magento`, e);
    }
    return null;
  }

  public getCustomer = async (id: number): Promise<Customer | null> => {
    try {
      return await this.client.customers.get(id);
    } catch (e) {
      log(`Failed to get Customer Id:${id} from Magento`, e);
    }
    return null;
  }

  public getTransaction = async (id: string): Promise<MagentoTransaction | null> => {
    try {
      return await this.client.transactions.getByTransactionId(id) || null;
    } catch (e) {
      log(`Failed to get Transaction Id:${id} from Magento`, e);
    }
    return null;
  }
}
