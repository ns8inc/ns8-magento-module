<?php
namespace NS8\Protect\Model;

use Magento\Sales\Api\Data\OrderInterface;
use NS8\Protect\Api\OrderScoreInterface;
use NS8\Protect\Helper\Order;

/**
 * Custom API to set Order Score data
 * @link https://www.scommerce-mage.com/blog/magento-2-how-to-create-custom-api.html
 * @link https://magento.stackexchange.com/questions/106337/magento-2-custom-authentication-for-api
 * @link http://url.com
 */
class OrderScore implements OrderScoreInterface
{
    /**
     * @var Order
     */
    protected $order;

    /**
     * Default constructor
     *
     * @param Order $order
     */
    public function __construct(
        Order $order
    ) {
        $this->order=$order;
    }

    /**
     * @api
     * @param string $orderId
     * @param int $eq8
     * @return bool true if the update succeeded
     */
    public function score($orderId, $eq8) : bool
    {
        $order = $this->order->getOrder($orderId);
        return $eq8 == $this->order->setEQ8Score($eq8, $order);
    }
}
