<?php

namespace NS8\Protect\Ui\Component\Listing\Column;

use Magento\Framework\View\Element\UiComponentFactory;
use Magento\Framework\View\Element\UiComponent\ContextInterface;
use Magento\Sales\Api\Data\OrderInterface;
use Magento\Ui\Component\Listing\Columns\Column;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Order;
use NS8\Protect\Helper\Store;

/**
 * EQ8Score Column Class
 *
 * This class handles populating the data necessary for the
 * EQ8 Score Column in the Sales Order Grid
 */
class EQ8Score extends Column
{
    /**
     * The config helper
     *
     * @var Config
     */
    protected $configHelper;

    /**
     * The order helper (not the order itself)
     *
     * @var Order
     */
    protected $orderHelper;

    /**
     * The store helper
     *
     * @var Store
     */
    protected $storeHelper;

    /**
     * Constructor
     *
     * @param ContextInterface $context The Magento Context
     * @param UiComponentFactory $uiComponentFactory The UI Component Factory
     * @param Config $configHelper The config helper
     * @param Order $orderHelper The order helper
     * @param Store $storeHelper The store helper
     * @param array $components The components
     * @param array $data The data
     */
    public function __construct(
        ContextInterface $context,
        UiComponentFactory $uiComponentFactory,
        Config $configHelper,
        Order $orderHelper,
        Store $storeHelper,
        array $components = [],
        array $data = []
    ) {
        $this->configHelper = $configHelper;
        $this->orderHelper = $orderHelper;
        $this->storeHelper = $storeHelper;

        if (!$this->isVisible()) {
            $data = [];
        }

        parent::__construct($context, $uiComponentFactory, $components, $data);
    }

    /**
     * Loop through the Orders and check for an EQ8 Score
     *
     * @param array $dataSource The Orders we'll be looping through
     *
     * @return array
     */
    public function prepareDataSource(array $dataSource): array
    {
        if (isset($dataSource['data']['items']) && $this->isVisible()) {
            $orderIds = [];
            // fetch EQ8 scores since $dataSource doesn't include them
            foreach ($dataSource['data']['items'] as $item) {
                $orderIds[] = $item[OrderInterface::ENTITY_ID];
            }
            $orderCollection = $this->orderHelper->getOrderEQ8Scores($orderIds);
            // populate $dataSource's items with formatted scores
            foreach ($dataSource['data']['items'] as &$item) {
                $orderId = $item[OrderInterface::ENTITY_ID];
                $order = $orderCollection->getItemById($orderId);
                $eq8Score = $order->get(Order::EQ8_SCORE_COL)[Order::EQ8_SCORE_COL];
                $item[Order::EQ8_SCORE_COL] = $this->orderHelper->formatEQ8ScoreLinkHtml(
                    $orderId,
                    $eq8Score === null ? null : (int)$eq8Score
                );
            }
        }
        return $dataSource;
    }

    /**
     * Check whether the EQ8 Score column should be visible to the current user
     * (based on whether any of the user's stores are currently active with NS8 Protect).
     *
     * @return bool True if the column is visible, False otherwise
     */
    protected function isVisible(): bool
    {
        foreach ($this->storeHelper->getUserStores() as $store) {
            if ($this->configHelper->isMerchantActive($store['id'])) {
                return true;
            }
        }

        return false;
    }
}
