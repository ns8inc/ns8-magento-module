<?php
namespace NS8\CSP2\Observer;

use Magento\Customer\Model\Session;
use Magento\Framework\App\ObjectManager;
use Magento\Framework\App\Request\DataPersistorInterface;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Sales\Api\Data\OrderInterface;
use NS8\CSP2\Helper\Config;
use NS8\CSP2\Helper\HttpClient;
use NS8\CSP2\Helper\Logger;

class OrderUpdate implements ObserverInterface
{
    protected $config;
    protected $customerSession;
    protected $httpClient;
    protected $logger;
    protected $order;
    protected $request;

    /**
     * Default constructor
     *
     * @param Config $config
     * @param Http $request
     * @param Logger $logger
     * @param OrderInterface $order
     * @param Session $session
     */
    public function __construct(
        Config $config,
        Http $request,
        HttpClient $httpClient,
        Logger $logger,
        OrderInterface $order,
        Session $session
    ) {
        $this->config = $config;
        $this->customerSession = $session;
        $this->httpClient = $httpClient;
        $this->logger = $logger;
        $this->order = $order;
        $this->request = $request;
    }

    /**
     * Attempt to add a status history as the order state changes
     * @param OrderInterface $order
     * @return ?string The last known status, or null
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
        } catch (Exception $e) {
        }
        return $oldStatus;
    }

    /**
     * Observer execute method
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer)
    {
        try {
            $order = $observer->getEvent()->getOrder();
            $orderData = $order->getData();
            $params = array();
            $state = $order->getState();
            $status = $order->getStatus();
            $oldStatus = $this->addStatusHistory($order);

            if (isset($oldStatus)) {
                $params = array('action'=>'UPDATE_ORDER_STATUS_ACTION');
            } elseif ($state == 'new' || $status == 'pending') {
                $params = array('action'=>'CREATE_ORDER_ACTION');
            } else {
                $params = array('action'=>'UPDATE_ORDER_STATUS_ACTION');
            }

            $data = array('order'=>$orderData);
            $response = $this->httpClient->post('/switch/executor', $data, $params);
        } catch (Exception $e) {
            $this->logger->error('The order update could not be processed', $e);
        }
    }
}
