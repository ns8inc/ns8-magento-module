import { Customer as MagentoCustomer } from '@ns8/magento2-rest-client';
import { handleApiError, validateBooleanHttpResponse } from '.';
import { Logger } from '@ns8/ns8-protect-sdk';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { RestClient } from '@ns8/magento2-rest-client';
import { ServiceIntegration } from 'ns8-protect-models';
import { StatusHistory as MagentoComment } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { Transaction as MagentoTransaction } from '@ns8/magento2-rest-client';

/**
 * A wrapper around the Magento2 REST Client for convience and error handling.
 * TODO: as the number of these convenience methods continues to grow, it would be worth factoring out some of the boilerplate into a private method to improve readability/maintainability.
 */
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

      //Constructing the REST client has no side effects. OAuth does not take place until an API call is made.
      this.client = new RestClient({
        url: `${this.SwitchContext.merchant.storefrontUrl}/index.php/rest`,
        consumerKey: si.identityToken,
        consumerSecret: si.identitySecret,
        accessToken: si.token,
        accessTokenSecret: si.secret
      })
    } catch (e) {
      Logger.error('Failed to construct RestClient', e);
    }
  }

  /**
   * Convenience method to get a [[MagentoOrder]] by OrderId from the Magento API.
   */
  public getOrder = async (orderId: number, attempts: number = 0, maxRetry: number = 5, waitMs: number = 2000): Promise<MagentoOrder | null> => {
    try {
      return await this.client.orders.get(orderId);
    } catch (e) {
      if (false === await handleApiError(e, this.getOrder, [orderId], attempts, maxRetry, waitMs)) {
        Logger.error(`Failed to get Order Id:${orderId} from Magento`, e);
      }
    }
    return null;
  }

  /**
   * Attempt to post a [[MagentoComment]] to a [[MagentoOrder]]. If successful, return true.
   */
  public postOrderComment = async (orderId: number, comment: string): Promise<boolean> => {
    let ret = false;
    try {
      const httpResponse = await this.client.orders.postComment(orderId, { comment: comment } as MagentoComment);
      ret = validateBooleanHttpResponse(httpResponse);
    } catch (e) {
      Logger.error(`Failed to add comment to Order Id:${orderId} in Magento API`, e);
    }
    return ret;
  }

  /**
   * Attempt to cancel a [[MagentoOrder]]. If successful, return true.
   */
  public cancelOrder = async (orderId: number): Promise<boolean> => {
    let ret = false;
    try {
      const httpResponse = await this.client.orders.cancel(orderId);
      ret = validateBooleanHttpResponse(httpResponse);
    } catch (e) {
      Logger.error(`Failed to cancel Order Id:${orderId} in Magento API`, e);
    }
    return ret;
  }

  /**
   * Attempt to place a [[MagentoOrder]] on hold. If successful, return true.
   * TODO: unit tests around holding/unholding
   */
  public holdOrder = async (orderId: number): Promise<boolean> => {
    let ret = false;
    try {
      const httpResponse = await this.client.orders.hold(orderId);
      ret = validateBooleanHttpResponse(httpResponse);
    } catch (e) {
      Logger.error(`Failed to hold Order Id:${orderId} in Magento API`, e);
    }
    return ret;
  }

  /**
   * Attempt to unhold a [[MagentoOrder]] (presumably already on hold). If successful, return true.
   * TODO: unit tests around holding/unholding
   */
  public unholdOrder = async (orderId: number): Promise<boolean> => {
    let ret = false;
    try {
      const httpResponse = await this.client.orders.unhold(orderId);
      ret = validateBooleanHttpResponse(httpResponse);
    } catch (e) {
      Logger.error(`Failed to hold Order Id:${orderId} in Magento API`, e);
    }
    return ret;
  }

  /**
   * Get a [[MagentoCustomer]] by Id
   */
  public getCustomer = async (customerId: number, attempts: number = 0, maxRetry: number = 5, waitMs: number = 2000): Promise<MagentoCustomer | null> => {
    try {
      return await this.client.customers.get(customerId);
    } catch (e) {
      if (false === await handleApiError(e, this.getCustomer, [customerId], attempts, maxRetry, waitMs)) {
        Logger.error(`Failed to get Customer Id:${customerId} from Magento`, e);
      }
    }
    return null;
  }

  /**
   * Get a [[MagentoTransaction]] by Id
   */
  public getTransaction = async (transactionId: string, attempts: number = 0, maxRetry: number = 5, waitMs: number = 2000): Promise<MagentoTransaction | null> => {
    try {
      return await this.client.transactions.getByTransactionId(transactionId) || null;
    } catch (e) {
      if (false === await handleApiError(e, this.getTransaction, [transactionId], attempts, maxRetry, waitMs)) {
        Logger.error(`Failed to get Transaction Id:${transactionId} from Magento`, e);
      }
    }
    return null;
  }
}
