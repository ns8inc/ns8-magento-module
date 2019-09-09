<?php

namespace NS8\CSP2\Controller\Adminhtml\Sales;

use \Magento\Backend\App\Action;
use \Magento\Backend\App\Action\Context;
use \Magento\Framework\View\Result\PageFactory;
use NS8\CSP2\Helper\HttpClient;
use NS8\CSP2\Helper\Logger;
use NS8\CSP2\Helper\Config;

class Dashboard extends Action
{
    /**
     * @var PageFactory
     */
    protected $resultPageFactory;

    /**
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * @var Logger
     */
    protected $logger;

    /**
     * Constructor
     *
     * @param Context $context
     * @param PageFactory $resultPageFactory
     */
    public function __construct(
        Context $context, 
        PageFactory $resultPageFactory, 
        HttpClient $httpClient,
        Logger $logger,
        Config $config)
    {
        parent::__construct($context);
        $this->resultPageFactory = $resultPageFactory;
        $this->httpClient = $httpClient;
        $this->logger = $logger;
        $this->config = $config;
    }

    /**
     * Load the page defined in view/adminhtml/layout/ns8csp2admin_sales_dashboard.xml
     *
     * @return \Magento\Framework\View\Result\Page
     */
    public function execute()
    {        
        $merchant = $this->httpClient->get('/protect/merchants/current', '');
        $this->logger->debug('MERCHANT ==> ' . $merchant->name);
        return $this->resultPageFactory->create();
    }
}
