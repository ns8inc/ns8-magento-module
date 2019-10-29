<?php

/**
 * The Verify controller.
 *
 * This handles the verification of orders (via email links).
 */
declare(strict_types=1);

namespace NS8\CSP2\Controller\Order;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\View\Result\Page;
use Magento\Framework\View\Result\PageFactory;

/**
 * The Verify controller.
 *
 * This handles the verification of orders (via email links).
 */
class Verify extends Action
{
    /**
     * The result page factory.
     *
     * @var ResultPageFactory
     */
    protected $resultPageFactory;

    /**
     * The constructor.
     *
     * @param Context $context
     */
    public function __construct(Context $context, PageFactory $resultPageFactory) {
        parent::__construct($context);
        $this->context = $context;
        $this->resultPageFactory = $resultPageFactory;
    }

    /**
     * View page action.
     *
     * @return Page The page
     */
    public function execute(): Page {
        return $this->resultPageFactory->create();
    }
}
