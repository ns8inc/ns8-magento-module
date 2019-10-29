<?php

namespace NS8\Protect\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\Exception\AlreadyExistsException;
use Magento\Integration\Model\ConfigBasedIntegrationManager;
use Magento\Sales\Model\Order;
use Magento\Sales\Model\Order\Status;
use Magento\Sales\Model\Order\StatusFactory;
use Magento\Sales\Model\ResourceModel\Order\Status as StatusResource;
use Magento\Sales\Model\ResourceModel\Order\StatusFactory as StatusResourceFactory;
use NS8\Protect\Helper\Logger;

/**
 * Creates (install/upgrade) or Deletes (uninstall) custom Protect states
 */
class CustomStatus extends AbstractHelper
{
    /**
     * Custom Holded (state) Merchant Review status code
     */
    const MERCHANT_REVIEW_STATUS = 'ns8_merchant_review';

    /**
     * Custom Holded (state) Merchant Review status label
     */
    const MERCHANT_REVIEW_STATUS_LABEL = 'NS8 Merchant Review';

    /**
     * Custom Processing (state) Approved status code
     */
    const APPROVED = 'ns8_approved';

    /**
     * Custom Processing (state) Approved status label
     */
    const APPROVED_LABEL = 'NS8 Approved';

    /**
     * Status Factory
     *
     * @var StatusFactory
     */
    protected $statusFactory;

    /**
     * Status Resource Factory
     *
     * @var StatusResourceFactory
     */
    protected $statusResourceFactory;

    /**
     * @var ConfigBasedIntegrationManager
     */
    protected $integrationManager;

    /**
     * Logger
     *
     * @var Logger
     */
    protected $logger;

    /**
     * Default constructor
     *
     * @param ConfigBasedIntegrationManager $integrationManager
     * @param Logger $logger
     * @param StatusFactory $statusFactory
     * @param StatusResourceFactory $statusResourceFactory
     */
    public function __construct(
        ConfigBasedIntegrationManager $integrationManager,
        Logger $logger,
        StatusFactory $statusFactory,
        StatusResourceFactory $statusResourceFactory
    ) {
        $this->integrationManager = $integrationManager;
        $this->logger = $logger;
        $this->statusFactory = $statusFactory;
        $this->statusResourceFactory = $statusResourceFactory;
    }

    /**
     * Creates new order processing status and assigns it to a state
     * @param string $statusName
     * @param string $statusLabel
     * @param mixed $state
     * @return void
     */
    protected function addCustomStatus($statusName, $statusLabel, $state)
    {
        /** @var StatusResource $statusResource */
        $statusResource = $this->statusResourceFactory->create();
        /** @var Status $status */
        $status = $this->statusFactory->create();
        $status->setData([
            'status' => $statusName,
            'label' => $statusLabel,
        ]);
        try {
            $statusResource->save($status);
        } catch (AlreadyExistsException $exception) {
            return;
        }
        $status->assignState($state, false, true);
    }

    /**
     * Sets the custom Protect states for Magento
     * @param string $upgradeMode
     * @return void
     */
    public function setCustomStatuses($upgradeMode)
    {
        $this->logger->debug($upgradeMode);
        $this->integrationManager->processIntegrationConfig(['NS8 Integration']);
        $this->addCustomStatus(self::MERCHANT_REVIEW_STATUS, self::MERCHANT_REVIEW_STATUS_LABEL, Order::STATE_HOLDED);
        $this->addCustomStatus(self::APPROVED, self::APPROVED_LABEL, Order::STATE_PROCESSING);
    }
}
