import { Customer as MagentoCustomer } from '@ns8/magento2-rest-client';
import { error } from '.';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { RestApiError } from '@ns8/magento2-rest-client';
import { RestClient } from '@ns8/magento2-rest-client';
import { ServiceIntegration } from 'ns8-protect-models';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { Transaction as MagentoTransaction } from '@ns8/magento2-rest-client';
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
      error('Failed to construct RestClient', e);
    }
  }

  private sleep = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleApiError = async (error, method, params, attempts: number = 0, maxRetry: number = 5, waitMs: number = 2000): Promise<any> => {
    if (error.statusCode === 404 && attempts < maxRetry) {
      attempts += 1;
      await this.sleep(waitMs);
      const args = [...params, attempts, maxRetry, waitMs];
      return await method(...args);
    } else {
      return false;
    }
  }

  public getOrder = async (id: number, attempts: number = 0, maxRetry: number = 5, waitMs: number = 2000): Promise<MagentoOrder | null> => {
    try {
      return await this.client.orders.get(id);
    } catch (e) {
      if(false === await this.handleApiError(e, this.getOrder, [id], attempts, maxRetry, waitMs)) {
        error(`Failed to get Order Id:${id} from Magento`, e);
      }
    }
    return null;
  }

  public getCustomer = async (id: number, attempts: number = 0, maxRetry: number = 5, waitMs: number = 2000): Promise<MagentoCustomer | null> => {
    try {
      return await this.client.customers.get(id);
    } catch (e) {
      if (false === await this.handleApiError(e, this.getCustomer, [id], attempts, maxRetry, waitMs)) {
        error(`Failed to get Customer Id:${id} from Magento`, e);
      }
    }
    return null;
  }

  public getTransaction = async (id: string, attempts: number = 0, maxRetry: number = 5, waitMs: number = 2000): Promise<MagentoTransaction | null> => {
    try {
      return await this.client.transactions.getByTransactionId(id) || null;
    } catch (e) {
      if (false === await this.handleApiError(e, this.getTransaction, [id], attempts, maxRetry, waitMs)) {
        error(`Failed to get Transaction Id:${id} from Magento`, e);
      }
    }
    return null;
  }
}
