<?php

declare(strict_types=1);

namespace NS8\Protect\Test;

use Magento\Cron\Model\Schedule;
use Magento\Sales\Model\Order as MagentoOrder;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Data\ProtectMetadata;
use NS8\Protect\Helper\CustomStatus as CustomStatus;
use NS8\Protect\Helper\Order as OrderHelper;
use NS8\Protect\Helper\Queue as QueueHelper;
use NS8\ProtectSDK\Queue\Client as QueueClient;
use NS8\Protect\Cron\Order as OrderCron;
use PHPUnit\Framework\TestCase;
use Zend\Uri\Uri;

/**
 * Tests for Helper\Config.php
 */
class OrderCronTest extends TestCase
{
    const TEST_QUEUE_URL_TEMPLATE = 'https://thiswebsite-%d.com';

    /** @var orderCron */
    protected $orderCron;

    const TEST_ORDER_INCREMENT_ID = '000001';
    const TEST_ORDER_ID = 1;

    const VALID_STORE_COUNT = 2;
    const MESSAGE_PER_STORE_COUNT = 3;

    /**
     * Constructor intended to set usable objects
     */
    public function __construct()
    {
        parent::__construct();

        $queueHelper = $this->createMock(QueueHelper::class);
        $queueHelper->method('deleteMessage')->willReturn(true);
        $queueHelper->method('getMessages')->willReturn([
            [
                'orderId' => '123',
                'receipt_handle' => '123',
                'score' => 100,
                'action' => QueueClient::MESSAGE_ACTION_UPDATE_EQ8_SCORE],
            [
                'orderId' => '123',
                'receipt_handle' => '123',
                'platformStatus' => CustomStatus::APPROVED,
                'action' => QueueClient::MESSAGE_ACTION_UPDATE_ORDER_STATUS_EVENT],
            [
                'orderId' => '123',
                'action' => 'gibberish'
            ]
        ]);
        $queueHelper->method('fetchQueueUrl')->will($this->returnCallback(function ($storeId) {
            return sprintf(self::TEST_QUEUE_URL_TEMPLATE, $storeId);
        }));

        $configHelper = $this->createMock(Config::class);
        $configHelper->method('getStoreMetadatas')->willReturn([
            new ProtectMetadata('token_1', true),
            new ProtectMetadata('token_2', false),
            new ProtectMetadata('token_3', true)
        ]);

        $orderHelper = $this->createMock(OrderHelper::class);
        $orderHelper->method('setEQ8Score')->willReturnArgument(0);
        $orderHelper->method('getOrderByIncrementId')->will($this->returnCallback(function ($orderIncrementId) {
            $order = $this->createMock(MagentoOrder::class);
            $order->method('getId')->willReturn(self::TEST_ORDER_ID);
            $order->method('getIncrementId')->willReturn(self::TEST_ORDER_INCREMENT_ID);
            $order->method('getState')->willReturn(MagentoOrder::STATE_PROCESSING);
            return $order;
        }));

        $this->orderCron = new OrderCron($configHelper, $orderHelper, $queueHelper);
    }

    /**
     * Tests retrieving active stores
     *
     * @return void
     */
    public function testGetStoreQueueAccessItems(): void
    {
        $storeArray = $this->orderCron->getStoreQueueAccessItems();

        $this->assertEquals(self::VALID_STORE_COUNT, count($storeArray));
        $this->assertEquals(sprintf(self::TEST_QUEUE_URL_TEMPLATE, 0), $storeArray[0]['url']);
        $this->assertEquals(sprintf(self::TEST_QUEUE_URL_TEMPLATE, 2), $storeArray[1]['url']);
    }

    /**
     * Test successfully approving an order
     *
     * @return void
     */
    public function testApproveOrderValidState(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_PROCESSING);
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, CustomStatus::APPROVED);
        $this->assertEquals(true, $orderUpdateSuccess);
    }

    /**
     * Test attempting to approve an order in a holded state
     *
     * @return void
     */
    public function testApproveOrderValidStateHolded(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_HOLDED);
        $order->method('canUnhold')->willReturn(false);
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, CustomStatus::APPROVED);
        $this->assertEquals(true, $orderUpdateSuccess);
    }

    /**
     * Test attempting to approve an order in an invalid state
     *
     * @return void
     */
    public function testApproveOrderInvalidState(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_CANCELED);
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, CustomStatus::APPROVED);
        $this->assertEquals(false, $orderUpdateSuccess);
    }

    /**
     * Test attempting to approve an order and an exception is thrown
     *
     * @return void
     */
    public function testApproveOrderExceptionThrown(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_HOLDED);
        $order->method('canUnhold')->willReturn(true);
        $order->method('unhold')->willThrowException(new \Exception('Test'));
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, CustomStatus::APPROVED);
        $this->assertEquals(false, $orderUpdateSuccess);
    }

    /**
     * Test successfully canceling an order
     *
     * @return void
     */
    public function testCancelOrderValidState(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_PROCESSING);
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, MagentoOrder::STATE_CANCELED);
        $this->assertEquals(true, $orderUpdateSuccess);
    }

    /**
     * Test attempting to cancel an order in an invalid state
     *
     * @return void
     */
    public function testCancelOrderInvalidState(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_PROCESSING);
        $order->method('canCancel')->willReturn(false);
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, MagentoOrder::STATE_CANCELED);
        // If an order cannot be canceled, we still expect a success response
        $this->assertEquals(true, $orderUpdateSuccess);
    }

    /**
     * Test canceling an order and an exception is thrown
     *
     * @return void
     */
    public function testCancelOrderExceptionThrown(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_HOLDED);
        $order->method('canUnhold')->willReturn(false);
        $order->method('canCancel')->willReturn(true);
        $order->method('cancel')->willThrowException(new \Exception('Test'));
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, MagentoOrder::STATE_CANCELED);
        $this->assertEquals(false, $orderUpdateSuccess);
    }

    /**
     * Test successfully holding an order
     *
     * @return void
     */
    public function testHoldOrderValidState(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_PROCESSING);
        $order->method('canHold')->willReturn(true);
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, MagentoOrder::STATE_HOLDED);
        // If an order cannot be holded, we still expect a success response
        $this->assertEquals(true, $orderUpdateSuccess);
    }

    /**
     * Test holding an order that cannot be holded per Magento
     *
     * @return void
     */
    public function testHoldOrderInvalidState(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_PROCESSING);
        $order->method('canHold')->willReturn(false);
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, MagentoOrder::STATE_HOLDED);
        $this->assertEquals(true, $orderUpdateSuccess);
    }

    /**
     * Test holding an order and an exception is thrown
     *
     * @return void
     */
    public function testHoldOrderExceptionThrown(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_PROCESSING);
        $order->method('canHold')->willReturn(true);
        $order->method('hold')->willThrowException(new \Exception('Test'));
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, MagentoOrder::STATE_HOLDED);
        $this->assertEquals(false, $orderUpdateSuccess);
    }

    /**
     * Test to ensure failing to add a status comment does not trigger order update failures
     *
     * @return void
     */
    public function testOrderCommentExceptionDoesNotVoidAction(): void
    {
        $order = $this->createMock(MagentoOrder::class);
        $order->method('getState')->willReturn(MagentoOrder::STATE_PROCESSING);
        $order->method('canHold')->willReturn(true);
        $order->method('canComment')->willReturn(true);
        $order->method('addStatusHistoryComment')->willThrowException(new \Exception('Test'));
        $orderUpdateSuccess = $this->orderCron->processOrderStatusUpdate($order, MagentoOrder::STATE_HOLDED);
        $this->assertEquals(true, $orderUpdateSuccess);
    }

    /**
     * Test batch execution logic
     *
     * @return void
     */
    public function testExecuteBatch(): void
    {
        $schedule = $this->createMock(Schedule::class);
        $schedule->method('getId')->willReturn(null);
        $attemptedMessageCount = $this->orderCron->execute($schedule);
        $expectedAttemptedMessageCount = self::VALID_STORE_COUNT * self::MESSAGE_PER_STORE_COUNT;
        $this->assertEquals($expectedAttemptedMessageCount, $attemptedMessageCount);
    }
}
