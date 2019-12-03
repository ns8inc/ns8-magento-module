<?php

namespace NS8\Protect\Controller\Adminhtml\Sessiondata;

use Magento\Backend\App\Action;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Backend\App\Action\Context;
use NS8\Protect\Helper\Session as SessionHelper;

/**
 * The Admin Session Data POST action
 */
class Index extends Action
{
    /**
     * @var JsonFactory
     */
    protected $jsonResultFactory;

    /**
     * @var SessionHelper
     */
    protected $sessionHelper;

    /**
     * Constructor
     *
     * @param Context $context The context
     * @param SessionHelper $sessionHelper
     */
    public function __construct(
        Context $context,
        JsonFactory $jsonResultFactory,
        SessionHelper $sessionHelper
    ) {
        parent::__construct($context);
        $this->jsonResultFactory = $jsonResultFactory;
        $this->sessionHelper = $sessionHelper;
    }

    /**
     * {@inheritdoc}
     */
    // @codingStandardsIgnoreStart (This is an inherited method)
    protected function _isAllowed()
    {
        return true;
    }
    // @codingStandardsIgnoreEnd

    /**
     * Set Session Data values based on POST request
     *
     * @return JsonFactory
     */
    public function execute()
    {
        // Retrieve desired session data values from POST body
        $postBody = $this->getRequest()->getPost()->getArrayCopy();

        $result = [];
        $savedSessionData = $this->sessionHelper->saveSessionDataFromPostBody($postBody);
        $result['data'] = $savedSessionData;
        if (count($savedSessionData) > 0) {
            $result['status'] = 'ok';
        } else {
            $result['status'] = 'no change';
        }

        // Create and return desired JSON response
        $response = $this->jsonResultFactory->create();
        $response->setData($result);
        return $response;
    }
}
