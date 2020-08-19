<?php

namespace NS8\Protect\Controller\Adminhtml\Shop;

use Throwable;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Exception\InputException;
use Magento\Framework\Message\ManagerInterface;
use NS8\Protect\Helper\Setup;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Store;

/**
 * The NS8 Protect shop management controller
 */
class Manage extends Action
{
    /**
     * Constructor
     *
     * @param Context $context The context
     * @param Config $config The config
     * @param Http $request The request object
     * @param JsonFactory $resultFactory The result factory
     * @param ManagerInterface $messageManager
     * @param Store $storeHelper The store helper
     * @param Setup $setup The setup helper
     */
    public function __construct(
        Context $context,
        Config $config,
        Http $request,
        JsonFactory $resultFactory,
        ManagerInterface $messageManager,
        Store $storeHelper,
        Setup $setup
    ) {
        parent::__construct($context);
        $this->context = $context;
        $this->resultFactory = $resultFactory;
        $this->config = $config;
        $this->messageManager = $messageManager;
        $this->request = $request;
        $this->storeHelper = $storeHelper;
        $this->setup = $setup;
    }

    /**
     * {@inheritdoc}
     */
    // @codingStandardsIgnoreStart (This is an inherited method)
    protected function _isAllowed()
    {
        return $this->config->isAllowed($this->context);
    }
    // @codingStandardsIgnoreEnd

    /**
     * calls activate or deactivate shops in the setup helper
     *
     * @return object
     */
    public function execute(): object
    {
        $body = $this->request->getPostValue();
        $result = $this->resultFactory->create();
        if (isset($body['activate'])) {
            $this->setup->activateShop($body['activate']);
            return $result->setData(['success' => true]);
        } elseif (isset($body['deactivate'])) {
            $this->setup->deactivateShop($body['deactivate']);
            return $result->setData(['success' => true]);
        }
        $errorMessage = 'The shop id is required to activate or deactivate Protect';
        $this->messageManager->addErrorMessage($errorMessage);
        return $result->setData([
            'success' => false,
            'error'=> true,
            'message' => $errorMessage
        ]);
    }
}
