<?php

namespace NS8\Protect\Observer;

use Throwable;
use Magento\Customer\Model\Session;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Session as SessionHelper;
use NS8\Protect\Helper\Store as StoreHelper;
use NS8\ProtectSDK\Actions\Client as ActionsClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;

/**
 * Responds to merchant update events
 */
class MerchantUpdate implements ObserverInterface
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
     * @param Session $session
     * @param SessionHelper $sessionHelper
     */
    public function __construct(
        Config $config,
        Http $request,
        Session $session,
        SessionHelper $sessionHelper,
        StoreHelper $storeHelper
    ) {
        $this->config = $config;
        $this->customerSession = $session;
        $this->request = $request;
        $this->sessionHelper = $sessionHelper;
        $this->storeHelper = $storeHelper;
        $this->loggingClient = new LoggingClient();
    }

    /**
     * Get either all shops, all shops associated with a particular website group, or a single shop from config data
     *
     * @param array $configData - event details
     * @return array
     */
    private function getAssociatedShops(array $configData): array
    {
        if ($configData['store'] !== null) {
            return [['id' => $configData['store']]];
        }
        if ($configData['website'] !== null) {
            return $this->storeHelper->getStoresByWebsite($configData['website']);
        }
        return $this->storeHelper->getAllStores();
    }
    /**
     * Observer execute method
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer) : void
    {
        $stores = [];
        try {
            $eventData = $observer->getEvent()->getData();
            if ($eventData['configData']) {
                $stores = $this->getAssociatedShops($eventData['configData']);
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('The event data could not be retrieved', $e);
            return;
        }

        $data = ['eventData' => $eventData, 'session' => $this->sessionHelper->getSessionData()];

        try {
            foreach ($stores as $store) {
                $this->config->initSdkConfiguration(true, $store['id']);
                // Send Action Update
                ActionsClient::setAction(ActionsClient::UPDATE_MERCHANT_ACTION, $data);
            }

        } catch (Throwable $e) {
            $this->loggingClient->error('The merchant update could not be processed', $e);
        }
    }
}
