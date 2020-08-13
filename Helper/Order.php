<?php

namespace NS8\Protect\Helper;

use Throwable;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Directory\Model\CountryFactory;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\RequestInterface;
use Magento\Sales\Api\Data\OrderInterface;
use Magento\Sales\Api\Data\TransactionSearchResultInterfaceFactory;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Sales\Model\Order as MagentoOrder;
use Magento\Sales\Model\ResourceModel\GridInterface;
use Magento\Sales\Model\ResourceModel\Order\Collection;
use Magento\Sales\Model\ResourceModel\Order\CollectionFactory;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Url;
use NS8\ProtectSDK\ClientSdk\Client as ClientSdkClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;
use NS8\ProtectSDK\Order\Client as OrderClient;
use UnexpectedValueException;

/**
 * Order Helper/Utility class with convenience methods for common ops
 */
class Order extends AbstractHelper
{
    public const EQ8_SCORE_COL = 'protect_eq8_score';

    /**
     * @var Config
     */
    protected $config;

    /**
     * @var CountryFactory
     */
    protected $countryFactory;

    /**
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * @var OrderRepositoryInterface
     */
    protected $orderRepository;

    /**
     * @var CollectionFactory
     */
    protected $orderCollectionFactory;

    /**
     * @var ProductRepositoryInterface
     */
    protected $productRepository;

    /**
     * @var RequestInterface
     */
    protected $request;

    /**
     * @var GridInterface
     */
    protected $salesOrderGrid;

    /**
     * @var SearchCriteriaBuilder
     */
    protected $searchCriteriaBuilder;

    /**
     * @var TransactionSearchResultInterfaceFactory
     */
    protected $transactionRepository;

    /**
     * @var Url
     */
    protected $url;

    /**
     * Default constructor
     *
     * @param CollectionFactory $orderCollectionFactory
     * @param Config $config
     * @param CountryFactory $countryFactory
     * @param GridInterface $salesOrderGrid
     * @param OrderRepositoryInterface $orderRepository
     * @param RequestInterface $request
     * @param SearchCriteriaBuilder $searchCriteriaBuilder;
     * @param TransactionSearchResultInterfaceFactory $transactionRepository
     * @param Url $url
     */
    public function __construct(
        CollectionFactory $orderCollectionFactory,
        Config $config,
        CountryFactory $countryFactory,
        GridInterface $salesOrderGrid,
        OrderRepositoryInterface $orderRepository,
        ProductRepositoryInterface $productRepository,
        RequestInterface $request,
        SearchCriteriaBuilder $searchCriteriaBuilder,
        TransactionSearchResultInterfaceFactory $transactionRepository,
        Url $url
    ) {
        $this->config = $config;
        $this->countryFactory = $countryFactory;
        $this->loggingClient = new LoggingClient();
        $this->orderCollectionFactory = $orderCollectionFactory;
        $this->orderRepository = $orderRepository;
        $this->productRepository = $productRepository;
        $this->request = $request;
        $this->salesOrderGrid = $salesOrderGrid;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
        $this->transactionRepository = $transactionRepository;
        $this->url = $url;
    }

    /**
     * Get the Order display id from the requested order
     * @param string|null $orderId
     * @return string|null An order increment id
     */
    public function getOrderIncrementId(string $orderId = null): ?string
    {
        $ret = null;
        $order = $this->getOrder($orderId);
        if (isset($order)) {
            $ret = $order->getIncrementId();
        }
        return $ret;
    }

    /**
     * Get an Order from an order id
     * @param string|null $orderId
     * @return OrderInterface|null An order
     */
    public function getOrder(string $orderId = null)
    {
        $ret = null;
        try {
            if (!isset($orderId)) {
                $orderId = $this->request->getParam('order_id');
            }
            if (isset($orderId)) {
                $ret = $this->orderRepository->get($orderId);
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get order '.$orderId, $e);
        }
        return $ret;
    }

    /**
     * Get an Order from an order increment id
     * @param string $orderIncrementId
     * @return OrderInterface|null An order
     */
    public function getOrderByIncrementId(string $orderIncrementId): ?OrderInterface
    {
        $ret = null;
        try {
            $searchCriteria = $this->searchCriteriaBuilder
                ->addFilter('increment_id', $orderIncrementId, 'eq')
                ->create();
            $orderList = $this->orderRepository->getList($searchCriteria)->getItems();
            $ret = count((array) $orderList) ? array_values($orderList)[0] : $ret;
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get order '.$orderIncrementId, $e);
        }
        return $ret;
    }

    /**
     * Get an EQ8 Score from an order id. If it does not exist locally, fetch it from the API and store it.
     * @param string|null $orderId
     * @return int|null An EQ8 Score for this order Id
     */
    public function getEQ8Score(string $orderId = null): ?int
    {
        $order = $this->getOrder($orderId);
        if (!isset($order)) {
            throw new UnexpectedValueException('Order Id: '.$orderId.' could not be found');
        }
        $eq8Score = $order->getData(self::EQ8_SCORE_COL);
        if (isset($eq8Score)) {
            return $eq8Score;
        }

        // Ensure Config Properties are set
        $this->config->initSdkConfiguration(true, (int) $order->getStoreId());

        $orderIncId = $order->getIncrementId();
        $orderData = OrderClient::getOrderByName($orderIncId);

        if (!isset($orderData->fraudAssessments)) {
            return null;
        }

        // The goal here is to look in the fraudAssessments array and return the first score we find that's an EQ8.
        $eq8Score = array_reduce(
            $orderData->fraudAssessments,
            function (?int $foundScore, \stdClass $fraudAssessment): ?int {
                if (!empty($foundScore)) {
                    return $foundScore;
                }
                return $fraudAssessment->providerType === 'EQ8' ? $fraudAssessment->score : null;
            }
        );
        if (!isset($eq8Score)) {
            return null;
        }

        $this->setEQ8Score($eq8Score, $order);
        return $eq8Score;
    }

    /**
     * Gets local EQ8 scores for a set of order IDs
     * Does not verify that all order IDs provided were found
     * @param array $orderIds
     * @return Collection the found orders
     */
    public function getOrderEQ8Scores(array $orderIds): Collection
    {
        return $this->orderCollectionFactory->create()
             ->addFieldToSelect(OrderInterface::ENTITY_ID)
             ->addFieldToSelect(self::EQ8_SCORE_COL)
             ->addFieldToFilter(OrderInterface::ENTITY_ID, ['in' => $orderIds])
             ;
    }

    /**
     * Sets the EQ8 Score on an order
     * @param int $eq8Score The score to persist
     * @param OrderInterface $order The order to update
     * @return int The saved EQ8 Score
     */
    public function setEQ8Score(int $eq8Score, OrderInterface $order) : int
    {
        $order
            ->setData(self::EQ8_SCORE_COL, $eq8Score)
            ->save();

        $this->salesOrderGrid->refresh($order->getId());
        return $eq8Score;
    }

    /**
     * Get an EQ8 Score from an order id. If it does not exist locally, fetch it from the API and store it.
     * @param OrderInterface $order
     * @return string An EQ8 Score link for this order
     */
    public function getEQ8ScoreLinkHtml(OrderInterface $order): string
    {
        $orderId = isset($order) ? $order->getId() : null;
        $eq8Score = isset($orderId)
            ? $this->getEQ8Score($orderId)
            : null;
        return $this->formatEQ8ScoreLinkHtml($orderId, $eq8Score);
    }

    /**
     * Format an EQ8 Score and orderId as a link, or return 'NA' if either value is `null`
     * @param string orderId
     * @param int $eq8Score
     *
     * @return string An HTML anchor tag with the score and an href to the order details
     */
    public function formatEQ8ScoreLinkHtml(?string $orderId, ?int $eq8Score): string
    {
        if (!isset($orderId) || !isset($eq8Score)) {
            return 'NA';
        }

        $order = $this->getOrder($orderId);
        $link = $this->url->getNS8IframeUrl(
            [
                'page' => ClientSdkClient::CLIENT_PAGE_ORDER_DETAILS,
                'order_id' => $orderId,
                'store_id' => $order->getStoreId()
            ]
        );
        return '<a href="'.$link.'">'.$eq8Score.'</a>';
    }

    /**
     * Return a collection of orders that are eligible for an NS8 Protect score but do not currently have one
     *
     * @param int $currentPage Optional integer value if you want to paginate results for processing
     * @param int $pageSize Optional integer value specifying the size of each page (count of results per query)
     *
     * @return Collection Returns a collection of orders eligible to be score by NS8 Protect
     */
    public function getNonScoredOrders(int $currentPage = null, int $pageSize = null): Collection
    {
        $nonFetchableOrderStates = [
            MagentoOrder::STATE_COMPLETE,
            MagentoOrder::STATE_CLOSED,
            MagentoOrder::STATE_CANCELED
        ];

        // Status filters ARE handled is the canCancel validation below, however, this filter reduces redundant checks
        $orderCollection = $this->orderCollectionFactory->create()
             ->addFieldToSelect('*')
             ->addFieldToFilter(self::EQ8_SCORE_COL, ['null' => true])
             ->addFieldToFilter('status', ['nin' => $nonFetchableOrderStates])
             ->setOrder('entity_id', 'DESC')
             ;

        if (!empty($currentPage) && !empty($pageSize)) {
            $orderCollection->setCurPage($currentPage);
            $orderCollection->setPageSize($pageSize);
        }

        foreach ($orderCollection as $index => $order) {
            if (!$order->canCancel()) {
                $orderCollection->removeItemByKey($index);
            }
        }

        return $orderCollection;
    }

    /**
     * Gets all the customer information
     *
     * @param OrderInterface $order
     * @return array
     */
    private function getCustomerData(OrderInterface $order) : array
    {
        $customer = [];
        try {
            $customer = [
                'dob' => $order->getCustomerDob(),
                'email' => $order->getCustomerEmail(),
                'first_name' => $order->getCustomerFirstname(),
                'gender' => $order->getCustomerGender(),
                'group_id' => $order->getCustomerGroupId(),
                'customer_id' => $order->getCustomerId(),
                'is_guest' => $order->getCustomerIsGuest(),
                'last_name' => $order->getCustomerLastname(),
                'middle_name' => $order->getCustomerMiddlename(),
                'note' => $order->getCustomerNote(),
                'note_notify' => $order->getCustomerNoteNotify(),
                'prefix' => $order->getCustomerPrefix(),
                'suffix' => $order->getCustomerSuffix(),
                'tax_vat' => $order->getCustomerTaxvat(),
            ];
            $customerId = $order->getCustomerId();
            if (!empty($customerId)) {
                $customerObj = $this->customerRepositoryInterface->getById($customerId);
            }
            if (!empty($customerObj)) {
                $customer['created_at'] = $customerObj->getCreatedAt();
                $customer['updated_at'] = $customerObj->getUpdatedAt();
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get Customer data', $e);
        }
        return $customer;
    }

    /**
     * Gets the address for billing
     *
     * @param OrderInterface $order
     * @return array
     */
    private function getBillingAddressData(OrderInterface $order) : array
    {
        $billingAddress = [];
        try {
            $billingAddressObj = $order->getBillingAddress();
            if (!empty($billingAddressObj)) {
                $billingAddress = $billingAddressObj->getData();
                if (!empty($billingAddress['country_id'])) {
                    $country = $this->countryFactory->create()->loadByCode($billingAddress['country_id']);
                    $billingAddress['country'] = $country->getName();
                }
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get Billing Address data', $e);
        }
        return $billingAddress;
    }

    /**
     * Gets the address for shipping
     *
     * @param OrderInterface $order
     * @return array
     */
    private function getShippingAddressData(OrderInterface $order) : array
    {
        $shippingAddress = [];
        try {
            $shippingAddressObj = $order->getShippingAddress();
            if (!empty($shippingAddressObj)) {
                $shippingAddress = $shippingAddressObj->getData();
                if (!empty($shippingAddress['country_id'])) {
                    $country = $this->countryFactory->create()->loadByCode($shippingAddress['country_id']);
                    $shippingAddress['country'] = $country->getName();
                }
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get Shipping Address data', $e);
        }
        return $shippingAddress;
    }

    /**
     * Gets all the payment and transaction data associated with an order
     *
     * @param OrderInterface $order
     * @return array
     */
    private function getPaymentData(OrderInterface $order) : array
    {
        $payment = [];
        try {
            $paymentObj = $order->getPayment();
            if (!empty($paymentObj)) {
                $payment = $paymentObj->getData();
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get Payment data', $e);
        }
        return $payment;
    }

    /**
     * Gets all the payment and transaction data associated with an order
     *
     * @param OrderInterface $order
     * @return array
     */
    private function getTransactionData(OrderInterface $order) : array
    {
        $transactions = [];
        try {
            $transactionsItems = $this->transactionRepository->create()->addOrderIdFilter($order->getId());
            $transactionsObj = $transactionsItems->getItems();
            if (!empty($transactionsObj)) {
                foreach ($transactionsObj as $item) {
                    $itemData = $item->getData();
                    array_push($transactions, $itemData);
                }
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get Transaction data', $e);
        }
        return $transactions;
    }

    /**
     * Gets all line items associated with an order
     *
     * @param OrderInterface $order
     * @return array
     */
    private function getItemsData(OrderInterface $order) : array
    {
        $items = [];
        try {
            $itemsObj = $order->getItems();
            if (!empty($itemsObj)) {
                foreach ($itemsObj as $item) {
                    $itemData = $item->getData();
                    if (!empty($itemData)) {
                        $product = $this->productRepository->getById($itemData['product_id']);
                        if (!empty($product)) {
                            $productData = $product->getData();
                            $itemData['name'] = $productData;
                        }
                        array_push($items, $itemData);
                    }
                }
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get Line Items data', $e);
        }
        return $items;
    }

    /**
     * Gets the complete history of status changes to an order
     *
     * @param OrderInterface $order
     * @return array
     */
    public function getOrderHistoryData(OrderInterface $order) : array
    {
        $history = [];
        try {
            $historyObj = $order->getStatusHistories();
            if (!empty($historyObj)) {
                foreach ($historyObj as $item) {
                    $historyData = [
                    'comment' => $item->getComment(),
                    'label' => $item->getStatusLabel(),
                    'status' => $item->getStatus()
                    ];
                    array_push($history, $historyData);
                }
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get History data', $e);
        }
        return $history;
    }

    /**
     * Gets all of the data associated with an order
     *
     * @param OrderInterface $order
     * @return array
     */
    public function getAllOrderData(OrderInterface $order) : array
    {
        $completeOrder = [
            'order' => $order->getData(),
            'currentState' => $order->getState(),
            'currentStatus' => $order->getStatus()
        ];
        $billingAddress = $this->getBillingAddressData($order);
        if (!empty($billingAddress)) {
            $completeOrder['billingAddress'] = $billingAddress;
        }
        $shippingAddress = $this->getShippingAddressData($order);
        if (!empty($shippingAddress)) {
            $completeOrder['shippingAddress'] = $shippingAddress;
        }
        $customer = $this->getCustomerData($order);
        if (!empty($customer)) {
            $completeOrder['customer'] = $customer;
        }
        $payment = $this->getPaymentData($order);
        if (!empty($payment)) {
            $completeOrder['payment'] = $payment;
        }
        $items = $this->getItemsData($order);
        if (!empty($items)) {
            $completeOrder['items'] = $items;
        }
        $transactions = $this->getTransactionData($order);
        if (!empty($transactions)) {
            $completeOrder['transactions'] = $transactions;
        }
        return $completeOrder;
    }
}
