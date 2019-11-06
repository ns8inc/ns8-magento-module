<?php

namespace NS8\Protect\Api;

interface OrderScoreInterface
{
    /**
     * Returns an EQ8 Score for the order
     *
     * @api
     * @param string $orderId An Order Id
     * @return string returns a score.
     */
    public function score($orderId);
}
