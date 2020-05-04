<?php

namespace NS8\Protect\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\Exception\AlreadyExistsException;
use Magento\Sales\Model\Order;
use Magento\Sales\Model\Order\Status;
use Magento\Sales\Model\Order\StatusFactory;
use Magento\Sales\Model\ResourceModel\Order\Status as StatusResource;
use Magento\Sales\Model\ResourceModel\Order\StatusFactory as StatusResourceFactory;
use NS8\ProtectSDK\Logging\Client as LoggingClient;

/**
 * Creates (install/upgrade) or Deletes (uninstall) custom Protect states
 */
class CustomStatus extends AbstractHelper
{
    /**
     * Custom Processing (state) Approved status code
     */
    const APPROVED = 'ns8_approved';

    /**
     * Custom Processing (state) Approved status label
     */
    const APPROVED_LABEL = 'NS8 Approved';

    /**
     * Custom Holded (state) Merchant Review status code
     */
    const MERCHANT_REVIEW_STATUS = 'ns8_merchant_review';

    /**
     * Custom Holded (state) Merchant Review status label
     */
    const MERCHANT_REVIEW_STATUS_LABEL = 'NS8 Merchant Review';

    /**
     * The logging client.
     *
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * The status factory.
     *
     * @var StatusFactory
     */
    protected $statusFactory;

    /**
     * The status resource factory.
     *
     * @var StatusResourceFactory
     */
    protected $statusResourceFactory;

    /**
     * Default constructor
     *
     * @param StatusFactory $statusFactory
     * @param StatusResourceFactory $statusResourceFactory
     */
    public function __construct(
        StatusFactory $statusFactory,
        StatusResourceFactory $statusResourceFactory
    ) {
        $this->statusFactory = $statusFactory;
        $this->statusResourceFactory = $statusResourceFactory;
        $this->loggingClient = new LoggingClient();
    }

    /**
     * Sets the custom Protect states for Magento
     *
     * @param string $upgradeMode
     *
     * @return void
     */
    public function setCustomStatuses(string $upgradeMode) : void
    {
        $this->loggingClient->debug($upgradeMode);
        $this->addCustomStatus(self::MERCHANT_REVIEW_STATUS, self::MERCHANT_REVIEW_STATUS_LABEL, Order::STATE_HOLDED);
        $this->addCustomStatus(self::APPROVED, self::APPROVED_LABEL, Order::STATE_PROCESSING);
    }

    /**
     * Creates new order processing status and assigns it to a state
     *
     * @param string $statusName
     * @param string $statusLabel
     * @param string $state
     *
     * @return void
     */
    protected function addCustomStatus(string $statusName, string $statusLabel, string $state) : void
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
}
