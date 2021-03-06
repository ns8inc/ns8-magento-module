<?php

/**
 * The Container class.
 *
 * This handles the Magento data and allows it to be retrieved by the view templates.
 */

declare(strict_types=1);

namespace NS8\Protect\Block\Adminhtml;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Event\ManagerInterface;
use Magento\Framework\View\Result\PageFactory;
use Magento\Store\Model\StoreManagerInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Order;
use NS8\Protect\Helper\Store;
use NS8\Protect\Helper\Url;
use NS8\ProtectSDK\ClientSdk\Client as ClientSdkClient;

/**
 * The Container class.
 *
 * This handles the Magento data and allows it to be retrieved by the view templates.
 */
class Container extends Template
{
    /**
     * The order helper.
     *
     * @var Order
     */
    public $order;

    /**
     * @var Config
     */
    public $config;

    /**
     * @var Url
     */
    public $url;

    /**
     * The context.
     *
     * @var Context
     */
    protected $context;

    /**
     * The request.
     *
     * @var Http
     */
    protected $request;

    /**
     * The page factory.
     *
     * @var PageFactory
     */
    protected $resultPageFactory;

    /**
     * The event manager.
     *
     * @var ManagerInterface
     */
    protected $eventManager;

    /**
     * Constructor
     *
     * @param Config $config
     * @param Context $context The context
     * @param ManagerInterface $eventManager The event manager
     * @param Http $request The request
     * @param Order $order The order helper
     * @param PageFactory $resultPageFactory The page factory
     * @param Url $url URL helper class
     */
    public function __construct(
        Config $config,
        Context $context,
        ManagerInterface $eventManager,
        Http $request,
        Order $order,
        PageFactory $resultPageFactory,
        Store $storeHelper,
        Url $url
    ) {
        parent::__construct($context);
        $this->config = $config;
        $this->context = $context;
        $this->eventManager = $eventManager;
        $this->order = $order;
        $this->request = $request;
        $this->resultPageFactory = $resultPageFactory;
        $this->url = $url;

        $storeId = $request->getParam('store_id', $storeHelper->getCurrentStore()['id']);
        $this->eventManager->dispatch(
            'ns8_protect_dashboard_container_instantiated',
            ['storeId' => $storeId]
        );
    }

    /**
     * Get the page to navigate to within the protect client
     *
     * @return string Access token to use initially upon page render
     */
    public function getInitialAccessToken() : string
    {
        $order = $this->order->getOrder();
        $storeId = $order ? (int) $order->getStoreId() : null;
        $accessToken = $this->config->getAccessToken($storeId);

        return (string) $accessToken;
    }
}
