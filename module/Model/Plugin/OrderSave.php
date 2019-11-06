<?php

namespace NS8\Protect\Model\Plugin;

use Exception;
use Magento\Framework\EntityManager\EntityManager;
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
     * @var  EntityManager
     */
    private $entityManager;

    /**
     * Order Extension Attributes Factory
     *
     * @var OrderExtensionFactory
     */
    protected $extensionFactory;

    /**
     * @var OrderInterface
     */
    protected $order;

    /**
     * OrderRepositoryPlugin constructor
     *
     * @param OrderExtensionFactory $extensionFactory
     */
    public function __construct(
        EntityManager $entityManager,
        OrderExtensionFactory $orderExtensionFactory
    ) {
        $this->entityManager = $entityManager;
        $this->orderExtensionFactory = $orderExtensionFactory;
    }

    /**
     * @param OrderRepositoryInterface $subject
     * @param OrderInterface $order
     * @return void
     */
    public function beforeSave(
        OrderRepositoryInterface $subject,
        OrderInterface $order
    ) {
        $this->currentOrder = $order;
    }

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
        // I don't think there is a meaningful difference between $order and $this->currentOrder
        //$extensionAttributes = $order->getExtensionAttributes();
        $extensionAttributes = $this->currentOrder->getExtensionAttributes() ?: $this->orderExtensionFactory->create();
        $eq8Score = $extensionAttributes->getEq8Score();
        $this->currentOrder->setExtensionAttributes($extensionAttributes);

        if (isset($eq8Score)) {
            try {
                // This doesn't work, but some examples suggest that it should. I assume there is some blackbox magic to associate the property with the order?
                // $eq8score->setOrderId($order->getId());

                // This seems like the most likely candidate to successfully save
                // see: https://github.com/magento/magento2-samples/blob/master/sample-external-links/Model/Plugin/Product/Repository.php#L140
                // $this->entityManager->save($this->currentOrder->getId(), $eq8Score);

                // This does not seem to have any affect, but it does not throw an error
                $this->currentOrder->save();

                // This will cause a stack overflow
                // $repository->save($this->currentOrder);
            } catch (Exception $e) {
                throw new CouldNotSaveException(
                    __('Could not add attribute to order: "%1"', $e->getMessage()),
                    $e
                );
            }
        }

        return $this->currentOrder;
    }
}
