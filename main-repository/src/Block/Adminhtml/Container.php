<?php

namespace NS8\CSP2\Block\Adminhtml;

use \Magento\Backend\Block\Template\Context;
use \Magento\Framework\View\Result\PageFactory;
use NS8\CSP2\Helper\Config;

class Container extends \Magento\Backend\Block\Template
{
    /**
     * @var PageFactory
     */
    private $resultPageFactory;
    private $context;
    private $configHelper;

    /**
     * Constructor
     *
     * @param Context $context
     * @param PageFactory $resultPageFactory
     * @param Config $configHelper
     */
    public function __construct(Context $context, PageFactory $resultPageFactory, Config $configHelper)
    {
        parent::__construct($context);
        $this->resultPageFactory = $resultPageFactory;
        $this->context = $context;
        $this->configHelper = $configHelper;
    }

    /**
     * Get the NS8 Client URl
     *
     * @return string
     */
    public function getNS8ClientUrl()
    {
        return $this->configHelper->getNS8ClientUrl();
    }
}
