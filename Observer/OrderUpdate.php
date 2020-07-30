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
use NS8\Protect\Helper\Order;
use NS8\Protect\Helper\Session as SessionHelper;
use NS8\ProtectSDK\Actions\Client as ActionsClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;

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
     * @var LoggingClient
     */
    protected $loggingClient;

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
     * The session helper.
     *
     * @var SessionHelper
     */
    protected $sessionHelper;

    /**
     * Default constructor
     *
     * @param Config $config
     * @param Http $request
     * @param Order $orderHelper
     * @param OrderInterface $order
     * @param Session $session,
     * @param SessionHelper $sessionHelper
     */
    public function __construct(
        Config $config,
        Http $request,
        Order $orderHelper,
        OrderInterface $order,
        Session $session,
        SessionHelper $sessionHelper
    ) {
        $this->config = $config;
        $this->customerSession = $session;
        $this->order = $order;
        $this->orderHelper = $orderHelper;
        $this->request = $request;
        $this->sessionHelper = $sessionHelper;
        $this->loggingClient = new LoggingClient();
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
            $this->loggingClient->error('Add Status History failed', $e);
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
            $currentOrder = $observer->getEvent()->getOrder();
            $orderData = $this->orderHelper->getAllOrderData($currentOrder);
            $state = $currentOrder->getState();
            $status = $currentOrder->getStatus();
            $oldStatus = $this->addStatusHistory($currentOrder);
            $isNew = $state == 'new' || $status == 'pending';
            $action = ActionsClient::CREATE_ORDER_ACTION;

            if (isset($oldStatus) || !$isNew) {
                // For some reason, credit card orders using Authorize.net will start in a state of "processing"
                // and Magento will automatically create a status history record. There is no sane way to know if
                // this order is new or not. This logic ensures that we treat the order as new by first testing if
                // we already have a score.
                try {
                    $eq8Score = $currentOrder->getData(Order::EQ8_SCORE_COL);
                    // If we haven't cached the EQ8 Score, get it now
                    if (!isset($eq8Score)) {
                        // This will fail if the order does not exist, and we'll remain in a CREATE_ORDER_ACTION state
                        $this->orderHelper->getEQ8Score($currentOrder->getId());
                    }
                    $action = ActionsClient::UPDATE_ORDER_STATUS_ACTION;
                } catch (Throwable $e) {
                    $this->loggingClient->error('Could not retrieve the EQ8 Score', $e);
                }
            }
            $statusHistory = $this->orderHelper->getOrderHistoryData($currentOrder);
            if (isset($statusHistory)) {
                $orderData['statusHistory'] = $statusHistory;
            }
            // Version our changes to this data structure
            $orderData['ns8_version'] = 2;
            $this->config->initSdkConfiguration(true, $currentOrder->getStoreId());
            $orderData['session'] = $this->sessionHelper->getSessionData();
            ActionsClient::setAction($action, $orderData);
        } catch (Throwable $e) {
            $this->loggingClient->error('The order update could not be processed', $e);
        }
    }
}
