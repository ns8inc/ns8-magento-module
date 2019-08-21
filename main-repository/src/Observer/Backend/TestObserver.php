<?php

namespace NS8\CSP2\Observer\Backend;
use Magento\Framework\Event\ObserverInterface;

class TestObserver implements ObserverInterface
{

    /**
     * Execute observer
     *
     * @param \Magento\Framework\Event\Observer $observer
     * @return void
     */
    public function execute(
        \Magento\Framework\Event\Observer $observer
    ) {
        //Your observer code
    }
}
