<?php
namespace NS8\Protect\Observer;

use Throwable;
use Magento\Customer\Model\Session;
use Magento\Framework\App\ObjectManager;
use Magento\Framework\App\Request\DataPersistorInterface;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Sales\Api\Data\OrderInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\HttpClient;
use NS8\Protect\Helper\Logger;
use NS8\Protect\Helper\Order;
use NS8\Protect\Helper\SwitchActionType;

/**
 * Responds to Order Update events
 */
class OrderUpdate implements ObserverInterface
{
    /**
     * @var Config
     */
    protected $config;

    /**
     * @var Session
     */
    protected $customerSession;

    /**
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * @var Logger
     */
    protected $logger;

    /**
     * @var OrderInterface
     */
    protected $order;

    /**
     * @var Order
     */
    protected $orderHelper;

    /**
     * @var Http
     */
    protected $request;

    /**
     * Default constructor
     *
     * @param Config $config
     * @param Http $request
     * @param HttpClient $httpClient
     * @param Logger $logger
     * @param Order $orderHelper
     * @param OrderInterface $order
     * @param Session $session
     */
    public function __construct(
        Config $config,
        Http $request,
        HttpClient $httpClient,
        Logger $logger,
        Order $orderHelper,
        OrderInterface $order,
        Session $session
    ) {
        $this->config = $config;
        $this->customerSession = $session;
        $this->httpClient = $httpClient;
        $this->logger = $logger;
        $this->order = $order;
        $this->orderHelper = $orderHelper;
        $this->request = $request;
    }

    /**
     * Attempt to add a status history as the order state changes
     * @param OrderInterface $order
     * @return string|null The last known status, or null
     */
    private function addStatusHistory(OrderInterface $order) : ?string
    {
        $oldStatus = null;
        try {
            $state = $order->getState();
            $status = $order->getStatus();
            $history = $order->getStatusHistories();
            if (!empty($history)) {
                $oldStatus = end($history)->getStatus();
            }
            if (!isset($oldStatus) || strpos($oldStatus, $status) !== 0) {
                $username = $this->config->getAuthenticatedUserName();
                $formattedNote = $status;
                if (isset($username)) {
                    $formattedNote = $formattedNote.' by '.$username;
                }
                $order
                    ->addStatusHistoryComment($formattedNote, $status)
                    ->setIsCustomerNotified(false)
                    ->setIsVisibleOnFront(false)
                    ->save();
            }
        } catch (Throwable $e) {
            $this->logger->error('Add Status History failed', ['error' => $e]);
        }
        return $oldStatus;
    }

    /**
     * Observer execute method
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer) : void
    {
        try {
            $order = $observer->getEvent()->getOrder();
            $orderData = $order->getData();
            $params = [];
            $state = $order->getState();
            $status = $order->getStatus();
            $oldStatus = $this->addStatusHistory($order);
            $isNew = $state == 'new' || $status == 'pending';

            if (isset($oldStatus) || !$isNew) {
                $params = ['action'=>SwitchActionType::UPDATE_ORDER_STATUS_ACTION];
                $eq8Score = $order->getData('eq8_score');
                //If we haven't cached the EQ8 Score, get it now
                if (!isset($eq8Score)) {
                    $this->orderHelper->getEQ8Score($order->getId());
                }
            } else {
                $params = ['action'=>SwitchActionType::CREATE_ORDER_ACTION];
            }

            $data = ['order'=>$orderData];
            $response = $this->httpClient->post('/switch/executor', $data, $params);
        } catch (Throwable $e) {
            $this->logger->error('The order update could not be processed', ['error' => $e]);
        }
    }
}
