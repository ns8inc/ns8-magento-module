<?php
namespace NS8\Protect\Test;

use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Directory\Model\CountryFactory;
use Magento\Framework\App\RequestInterface;
use Magento\Sales\Api\Data\OrderInterface;
use Magento\Sales\Api\Data\TransactionSearchResultInterfaceFactory;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Sales\Model\ResourceModel\GridInterface;
use Magento\Sales\Model\ResourceModel\Order\CollectionFactory;
use NS8\Protect\Helper\Order as OrderHelper;
use NS8\Protect\Helper\Protect as ProtectHelper;
use NS8\Protect\Helper\Url as UrlHelper;
use NS8\Protect\Test\Mock\MockOrder;
use NS8\Protect\Test\Mock\MockOrderClient;
use PHPUnit\Framework\TestCase;

class OrderTest extends TestCase
{
    /** @var OrderHelper */
    private $orderHelper;

    /** @var OrderInterface[] */
    private $orders;

    public function __construct()
    {
        parent::__construct();

        $orderCollectionFactoryTemp = $this->createMock(CollectionFactory::class);
        /** @var CollectionFactory */
        $orderCollectionFactory = $orderCollectionFactoryTemp;

        $config = (new ConfigTest())->config;

        /** @var CountryFactory */
        $countryFactory = $this->createMock(CountryFactory::class);

        /** @var GridInterface */
        $salesOrderGrid = $this->createMock(GridInterface::class);

        $orderRepositoryTemp = $this->createMock(OrderRepositoryInterface::class);
        $orderRepositoryTemp->method("get")
            ->will($this->returnCallback(function ($orderId) {
                return isset($this->orders[$orderId]) ? $this->orders[$orderId] : null;
            }));
        /** @var OrderRepositoryInterface */
        $orderRepository = $orderRepositoryTemp;

        /** @var ProductRepositoryInterface */
        $productRepository = $this->createMock(ProductRepositoryInterface::class);

        /** @var RequestInterface */
        $request = $this->createMock(RequestInterface::class);

        /** @var SearchCriteriaBuilder */
        $searchCriteriaBuilder = $this->createMock(SearchCriteriaBuilder::class);

        /** @var TransactionSearchResultInterfaceFactory */
        $transactionRepository = $this->createMock(TransactionSearchResultInterfaceFactory::class);

        /** @var UrlHelper */
        $urlHelper = $this->createMock(UrlHelper::class);

        $protectHelperTemp = $this->createMock(ProtectHelper::class);
        $protectHelperTemp->method("getOrderClient")
            ->willReturn(new MockOrderClient());
        /** @var ProtectHelper */
        $protectHelper = $protectHelperTemp;

        $this->orderHelper = new OrderHelper(
            $orderCollectionFactory,
            $config,
            $countryFactory,
            $salesOrderGrid,
            $orderRepository,
            $productRepository,
            $request,
            $searchCriteriaBuilder,
            $transactionRepository,
            $urlHelper,
            $protectHelper
        );
    }

    /**
     * Order::getEQ8Score() should return the cached score (in Magento DB) if present
     */
    public function testGetEQ8ScoreReturnsCachedValue()
    {
        $this->orders = [
            1 => $this->createMockOrder("1", "1", 5)
        ];
        $score = $this->orderHelper->getEQ8Score(1);
        $this->assertEquals($score, 5);
    }

    /**
     * Order::getEQ8Score() should return the score from Protect if no cached score exists
     */
    public function testGetEQ8ScoreReturnsFetchedValue()
    {
        $this->setProtectOrders([ [
            "name" => "1",
            "fraudAssessments" => [ [
                "providerType" => "EQ8",
                "score" => 10
            ] ]
        ] ]);
        $this->orders = [
            1 => $this->createMockOrder("1", "1", null)
        ];
        $score = $this->orderHelper->getEQ8Score(1);
        $this->assertEquals($score, 10);
    }

    /**
     * Order::getEQ8Score() should return 0 when Protect returns 0
     */
    public function testGetEQ8ScoreReturnsZero()
    {
        $this->setProtectOrders([ [
            "name" => "1",
            "fraudAssessments" => [ [
                "providerType" => "EQ8",
                "score" => 0
            ] ]
        ] ]);
        $this->orders = [
            1 => $this->createMockOrder("1", "1", null)
        ];
        $score = $this->orderHelper->getEQ8Score(1);
        $this->assertEquals($score, 0);
    }

    private function createMockOrder(string $incrementId, string $storeId, ?int $eq8Score): OrderInterface
    {
        return new MockOrder([
            MockOrder::INCREMENT_ID => $incrementId,
            MockOrder::STORE_ID => $storeId,
            OrderHelper::EQ8_SCORE_COL => $eq8Score
        ]);
    }

    private function setProtectOrders(array $orders): void
    {
        // dirty way to deep-convert array to object
        MockOrderClient::$orders = json_decode(json_encode($orders));
    }
}
