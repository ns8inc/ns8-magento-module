<?php

namespace NS8\Protect\Model\Plugin;

use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Sales\Api\Data\OrderInterface;
use Magento\Sales\Api\Data\OrderExtensionFactory;
use NS8\Protect\Model\Eq8Score;

/**
 * Custom GET plugin for EAV `eq8_score` property
 */
class OrderGet
{
    /**
     * Order Extension Attributes Factory
     *
     * @var OrderExtensionFactory
     */
    protected $extensionFactory;

    /**
     * Order Extension Factory constructor
     *
     * @param OrderExtensionFactory $extensionFactory
     */
    public function __construct(
        OrderExtensionFactory $orderExtensionFactory
    ) {
        $this->orderExtensionFactory = $orderExtensionFactory;
    }

    /**
     * Inherited method invoked after the property is fetched
     *
     * @param OrderRepositoryInterface $repository
     * @param OrderInterface $order
     * @return OrderInterface
     */
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

    /**
     * Internal logic to get the `eq8_score` property
     *
     * @param OrderInterface $order
     * @param OrderRepositoryInterface $repository
     * @return OrderInterface
     */
    private function getEq8ScoreAttribute(OrderInterface $order, OrderRepositoryInterface $repository)
    {
        $eq8Score = $order->getData(Eq8Score::FIELD_NAME);
        $extensionAttributes = $order->getExtensionAttributes();
        $extensionAttributes = $extensionAttributes ? $extensionAttributes : $this->extensionFactory->create();
        if (isset($eq8Score)) {
            $extensionAttributes->setEq8Score($eq8Score);
        }
        $order->setExtensionAttributes($extensionAttributes);
        return $order;
    }
}
