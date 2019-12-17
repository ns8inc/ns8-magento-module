import { Customer as MagentoCustomer } from '@ns8/magento2-rest-client';
import { Logger } from '@ns8/ns8-protect-sdk';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { RestClient } from '@ns8/magento2-rest-client';
import { RestLogLevel } from '@ns8/magento2-rest-client';
import { StatusHistory as MagentoComment } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { Transaction as MagentoTransaction } from '@ns8/magento2-rest-client';
import { handleApiError, RetryConfig } from './utils';

/**
 * A wrapper around the Magento2 REST Client for convience and error handling.
 * TODO: as the number of these convenience methods continues to grow, it would be worth factoring out some of the boilerplate into a private method to improve readability/maintainability.
 */
export class MagentoClient {
  private SwitchContext: SwitchContext;

  public client: RestClient;

  private apiUrl: string;

  // Constructing the REST client has no side effects. OAuth does not take place until an API call is made.
  constructor(switchContext: SwitchContext) {
    try {
      this.SwitchContext = switchContext;
      const si = this.SwitchContext.merchant.serviceIntegrations.find(
        integration => {
          return integration.type === 'MAGENTO';
        }
      );
      if (!si)
        throw new Error(
          'No Magento Service Integration defined on this merchant'
        );

      // TODO: refactor this to handle cases where these assumptions cannot be made
      this.apiUrl = `${(
        this.SwitchContext.merchant.storefrontUrl ||
        `https://${this.SwitchContext.merchant.domain}`
      ).replace(/\/*(index.php)?\/*$/, '')}/index.php/rest`;
      Logger.log(`API URL: "${this.apiUrl}"`);
      this.client = new RestClient({
        url: this.apiUrl,
        consumerKey: si.identityToken,
        consumerSecret: si.identitySecret,
        accessToken: si.token,
        accessTokenSecret: si.secret,
        logLevel: RestLogLevel.NONE
      });
    } catch (e) {
      Logger.error('Failed to construct RestClient', e);
    }
  }

  public getApiUrl = (): string => this.apiUrl;

  /**
   * Convenience method to get a [[MagentoOrder]] by OrderId from the Magento API.
   */
  public getOrder = async (
    orderId: number,
    retryConfig: RetryConfig = new RetryConfig({ key: orderId })
  ): Promise<MagentoOrder | null> => {
    try {
      return await this.client.orders.get(orderId);
    } catch (e) {
      if (
        (await handleApiError(
          e,
          async () => this.getOrder(orderId, retryConfig),
          retryConfig
        )) === false
      ) {
        Logger.log(`Failed to get Order Id:${orderId} from Magento`);
      }
    }
    return null;
  };

  /**
   * Convenience method to get a [[MagentoOrder]] by increment_id from the Magento API.
   */
  public getOrderByIncrementId = async (
    incrementId: string,
    retryConfig: RetryConfig = new RetryConfig({ key: incrementId })
  ): Promise<MagentoOrder | null> => {
    try {
      return await this.client.orders.getByIncrementId(incrementId);
    } catch (e) {
      if (
        (await handleApiError(
          e,
          async () => this.getOrderByIncrementId(incrementId, retryConfig),
          retryConfig
        )) === false
      ) {
        Logger.log(
          `Failed to get Order increment_id:${incrementId} from Magento`
        );
      }
    }
    return null;
  };

  /**
   * Attempt to post a [[MagentoComment]] to a [[MagentoOrder]]. If successful, return true.
   */
  public postOrderComment = async (
    orderId: number,
    comment: MagentoComment
  ): Promise<boolean> => {
    let ret = false;
    try {
      await this.client.orders.postComment(orderId, comment);
      ret = true;
    } catch (e) {
      Logger.error(
        `Failed to add comment to Order Id:${orderId} in Magento API`,
        e
      );
    }
    return ret;
  };

  /**
   * Attempt to cancel a [[MagentoOrder]]. If successful, return true.
   */
  public cancelOrder = async (orderId: number): Promise<boolean> => {
    let ret = false;
    try {
      await this.client.orders.cancel(orderId);
      ret = true;
    } catch (e) {
      Logger.error(`Failed to cancel Order Id:${orderId} in Magento API`, e);
    }
    return ret;
  };

  /**
   * Attempt to place a [[MagentoOrder]] on hold. If successful, return true.
   * TODO: unit tests around holding/unholding
   */
  public holdOrder = async (orderId: number): Promise<boolean> => {
    let ret = false;
    try {
      await this.client.orders.hold(orderId);
      ret = true;
    } catch (e) {
      Logger.error(`Failed to hold Order Id:${orderId} in Magento API`, e);
    }
    return ret;
  };

  /**
   * Attempt to unhold a [[MagentoOrder]] (presumably already on hold). If successful, return true.
   * TODO: unit tests around holding/unholding
   */
  public unholdOrder = async (orderId: number): Promise<boolean> => {
    let ret = false;
    try {
      const httpResponse = await this.client.orders.unhold(orderId);
      ret = true;
    } catch (e) {
      Logger.error(`Failed to hold Order Id:${orderId} in Magento API`, e);
    }
    return ret;
  };

  /**
   * Get a [[MagentoCustomer]] by Id
   */
  public getCustomer = async (
    customerId: number,
    retryConfig: RetryConfig = new RetryConfig({ key: customerId })
  ): Promise<MagentoCustomer | null> => {
    try {
      return await this.client.customers.get(customerId);
    } catch (e) {
      if (
        (await handleApiError(
          e,
          async () => this.getCustomer(customerId, retryConfig),
          retryConfig
        )) === false
      ) {
        Logger.error(`Failed to get Customer Id:${customerId} from Magento`, e);
      }
    }
    return null;
  };

  /**
   * Get a [[MagentoTransaction]] by Id
   */
  public getTransaction = async (
    transactionId: string,
    retryConfig: RetryConfig = new RetryConfig({ key: transactionId })
  ): Promise<MagentoTransaction | null> => {
    try {
      return (
        (await this.client.transactions.getByTransactionId(transactionId)) ||
        null
      );
    } catch (e) {
      if (
        (await handleApiError(
          e,
          async () => this.getTransaction(transactionId, retryConfig),
          retryConfig
        )) === false
      ) {
        Logger.error(
          `Failed to get Transaction Id:${transactionId} from Magento`,
          e
        );
      }
    }
    return null;
  };

  /**
   * Attach an EQ8 Score to a Magento order
   */
  public postScore = async (
    orderId: string,
    eq8Score: number
  ): Promise<boolean | null> => {
    try {
      return (
        (await this.client.post(`/Protect/score/${orderId}/${eq8Score}`)) ||
        null
      );
    } catch (e) {
      Logger.error(
        `Failed to set Order ${orderId}'s EQ8 Score to ${eq8Score}`,
        e
      );
    }
    return null;
  };
}
