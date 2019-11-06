<?php
namespace NS8\Protect\Model;

use NS8\Protect\Api\OrderScoreInterface;

class OrderScore implements OrderScoreInterface
{
    /**
     * @api
     * @param string $orderId Order Id.
     * @return string EQ8 Score.
     */
    public function score($orderId)
    {
        return "Order Id: " . $orderId;
    }
}
