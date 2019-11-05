<?php

namespace NS8\Protect\Model\Plugin;

use Magento\Framework\Exception\CouldNotSaveException;
use Magento\Sales\Api\Data\OrderExtensionFactory;
use Magento\Sales\Api\Data\OrderInterface;
use Magento\Sales\Api\OrderRepositoryInterface;
use NS8\Protect\Model\Eq8Score;

/**
 * Custom SAVE plugin for EAV `eq8_score` property
 */
class OrderSave
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

    /**
     * Inherited method invoked after the property is saved
     *
     * @param OrderRepositoryInterface $repository
     * @param OrderInterface $order
     * @return OrderInterface
     */
    public function afterSave(
        OrderRepositoryInterface $repository,
        OrderInterface $resultOrder
    ) {
        $resultOrder = $this->saveEq8ScoreAttribute($resultOrder, $repository);
        return $resultOrder;
    }

    /**
     * Internal logic to save the `eq8_score` property
     *
     * @param OrderInterface $order
     * @param OrderRepositoryInterface $repository
     * @return OrderInterface
     */
    private function saveEq8ScoreAttribute(OrderInterface $order, OrderRepositoryInterface $repository)
    {
        $extensionAttributes = $order->getExtensionAttributes();
        $eq8score = $extensionAttributes->getEq8Score();
        if (isset($eq8score)) {
            //$eq8score = $eq8ScoreAttr->getValue();
            try {
                $repository->save($eq8score);
            } catch (\Exception $e) {
                throw new CouldNotSaveException(
                    __('Could not add attribute to order: "%1"', $e->getMessage()),
                    $e
                );
            }
        }
        return $order;
    }
}
