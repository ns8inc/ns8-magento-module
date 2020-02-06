<?php

namespace NS8\Protect\Helper;

use Throwable;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\RequestInterface;
use Magento\Sales\Api\Data\OrderInterface;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Sales\Model\ResourceModel\GridInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Url;
use NS8\ProtectSDK\Order\Client as OrderClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;
use UnexpectedValueException;

/**
 * Order Helper/Utility class with convenience methods for common ops
 */
class Order extends AbstractHelper
{

    public const EQ8_SCORE_COL = 'eq8_score';

    /**
     * @var Config
     */
    protected $config;

    /**
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * @var OrderRepositoryInterface
     */
    protected $orderRepository;

    /**
     * @var RequestInterface
     */
    protected $request;

    /**
     * @var GridInterface
     */
    protected $salesOrderGrid;

    /**
     * @var Url
     */
    protected $url;

    /**
     * Default constructor
     *
     * @param Config $config
     * @param OrderRepositoryInterface $orderRepository
     * @param RequestInterface $request
     * @param GridInterface $salesOrderGrid
     * @param Url $url
     */
    public function __construct(
        Config $config,
        OrderRepositoryInterface $orderRepository,
        RequestInterface $request,
        GridInterface $salesOrderGrid,
        Url $url
    ) {
        $this->config = $config;
        $this->orderRepository = $orderRepository;
        $this->request = $request;
        $this->salesOrderGrid = $salesOrderGrid;
        $this->url = $url;
        $this->loggingClient = new LoggingClient();
    }

    /**
     * Get the Order display id from the requested order
     * @param string|null $orderId
     * @return string|null An order increment id
     */
    public function getOrderIncrementId(string $orderId = null): ?string
    {
        $ret = null;
        $order = $this->getOrder($orderId);
        if (isset($order)) {
            $ret = $order->getIncrementId();
        }
        return $ret;
    }

    /**
     * Get an Order from an order id
     * @param string|null $orderId
     * @return OrderInterface|null An order
     */
    public function getOrder(string $orderId = null)
    {
        $ret = null;
        try {
            if (!isset($orderId)) {
                $orderId = $this->request->getParam('order_id');
            }
            if (isset($orderId)) {
                $ret = $this->orderRepository->get($orderId);
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get order '.$orderId, $e);
        }
        return $ret;
    }

    /**
     * Get an EQ8 Score from an order id. If it does not exist locally, fetch it from the API and store it.
     * @param string|null $orderId
     * @return int|null An EQ8 Score for this order Id
     */
    public function getEQ8Score(string $orderId = null): ?int
    {
        $order = $this->getOrder($orderId);
        if (!isset($order)) {
            throw new UnexpectedValueException('Order Id: '.$orderId.' could not be found');
        }
        $eq8Score = $order->getData(self::EQ8_SCORE_COL);
        if (isset($eq8Score)) {
            return $eq8Score;
        }

        // Ensure Config Properties are set
        $this->config->initSdkConfiguration();

        $orderIncId = $order->getIncrementId();
        $orderData = OrderClient::getOrderByName($orderIncId);

        if (!isset($orderData->fraudAssessments)) {
            return null;
        }

        // The goal here is to look in the fraudAssessments array and return the first score we find that's an EQ8.
        $eq8Score = array_reduce(
            $orderData->fraudAssessments,
            function (?int $foundScore, \stdClass $fraudAssessment): ?int {
                if (!empty($foundScore)) {
                    return $foundScore;
                }
                return $fraudAssessment->providerType === 'EQ8' ? $fraudAssessment->score : null;
            }
        );
        if (!isset($eq8Score)) {
            return null;
        }

        $this->setEQ8Score($eq8Score, $order);
        return $eq8Score;
    }

    /**
     * Sets the EQ8 Score on an order
     * @param int $eq8Score The score to persist
     * @param OrderInterface $order The order to update
     * @return int The saved EQ8 Score
     */
    public function setEQ8Score(int $eq8Score, OrderInterface $order) : int
    {
        $order
            ->setData(self::EQ8_SCORE_COL, $eq8Score)
            ->save();

        $this->salesOrderGrid->refresh($order->getId());
        return $eq8Score;
    }

    /**
     * Get an EQ8 Score from an order id. If it does not exist locally, fetch it from the API and store it.
     * @param OrderInterface $order
     * @return string An EQ8 Score link for this order
     */
    public function getEQ8ScoreLinkHtml(OrderInterface $order): string
    {
        $orderId = isset($order) ? $order->getId() : null;
        $eq8Score = isset($orderId)
            ? $this->getEQ8Score($orderId)
            : null;
        return $this->formatEQ8ScoreLinkHtml($orderId, $eq8Score);
    }

    /**
     * Format an EQ8 Score and orderId as a link, or return "NA" if either value is `null`
     * @param string orderId
     * @param int $eq8Score
     * @param string An HTML anchor tag with the score and an href to the order details
     */
    public function formatEQ8ScoreLinkHtml(?string $orderId, ?int $eq8Score): string
    {
        if (!isset($orderId) || !isset($eq8Score)) {
            return 'NA';
        }
        // `page` must match `ClientPage.ORDER_DETAILS` in JS SDK
        $link = $this->url->getNS8IframeUrl(['page' => 'ORDER_DETAILS', 'order_id' => $orderId]);
        return '<a href="'.$link.'">'.$eq8Score.'</a>';
    }
}
