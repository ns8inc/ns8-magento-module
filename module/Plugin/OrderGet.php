<?php

namespace NS8\Protect\Plugin;

use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Sales\Api\Data\OrderInterface;
use Magento\Sales\Api\Data\OrderExtensionFactory;
use NS8\Protect\Model\Eq8Score;

class OrderGet
{
    /**
     * Order Extension Attributes Factory
     *
     * @var OrderExtensionFactory
     */
    protected $extensionFactory;

    /**
     * OrderRepositoryPlugin constructor
     *
     * @param OrderExtensionFactory $extensionFactory
     */
    public function __construct(
        OrderExtensionFactory $orderExtensionFactory
    ) {
        $this->orderExtensionFactory = $orderExtensionFactory;
    }

    public function afterGet(
        OrderRepositoryInterface $repository,
        OrderInterface $order
    ) {
        return $this->getEq8ScoreAttribute($order, $repository);
    }

    /**
     * Add "order_comment" extension attribute to order data object to make it accessible in API data of all order list
     *
     * @return OrderSearchResultInterface
     */
    public function afterGetList(OrderRepositoryInterface $repository, OrderSearchResultInterface $searchResult)
    {
        $orders = $searchResult->getItems();
        foreach ($orders as &$order) {
            $this->getEq8ScoreAttribute($order, $repository);
        }
        return $searchResult;
    }

    private function getEq8ScoreAttribute(OrderInterface $order, OrderRepositoryInterface $repository)
    {
        $eq8Score = $order->getData(Eq8Score::FIELD_NAME);
        $extensionAttributes = $order->getExtensionAttributes();
        $extensionAttributes = $extensionAttributes ? $extensionAttributes : $this->extensionFactory->create();
        $extensionAttributes->setEq8Score($eq8Score);
        $order->setExtensionAttributes($extensionAttributes);
        return $order;
    }
}
