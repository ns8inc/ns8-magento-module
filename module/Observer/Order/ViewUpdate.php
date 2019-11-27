<?php
namespace NS8\Protect\Observer\Order;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Registry;

/**
 * Responds to Order Update events
 */
class ViewUpdate implements ObserverInterface
{
    /**
     * @var Registry
     */
    protected $coreRegistry;

    public function __construct(
        Registry $registry
    ) {
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
