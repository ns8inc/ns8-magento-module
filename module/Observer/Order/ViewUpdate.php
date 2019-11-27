<?php
namespace NS8\Protect\Observer\Order;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Registry;
use NS8\Protect\Helper\Logger;

/**
 * Responds to Order Update events
 */
class ViewUpdate implements ObserverInterface
{
    /**
     * @var Logger
     */
    protected $logger;
    protected $coreRegistry;

    public function __construct(
        Logger $logger,
        Registry $registry
    ) {
        $this->logger = $logger;
        $this->coreRegistry = $registry;
    }

    /**
     * Observer execute method
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer) : void
    {
        $block = $observer->getBlock();
        if ($block->getId() == 'ns8_order_review') {
            $this->coreRegistry->register('ns8_order_review_tab_exists', true);
        }
    }
}
