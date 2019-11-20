<?php

namespace NS8\Protect\Api;

interface OrderScoreInterface
{
    /**
     * Updates an EQ8 Score for the order
     *
     * @api
     * @param string $orderId An Order Id
     * @param int $eq8 An EQ8 score
     * @return bool returns if score was successfully set.
     */
    public function score(string $orderId, int $eq8): bool;
}
