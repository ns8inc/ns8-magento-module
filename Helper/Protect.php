<?php
namespace NS8\Protect\Helper;

use NS8\ProtectSDK\Order\Client as OrderClient;

/**
 * A helper to allow mocking of SDK classes.
 */
class Protect
{
    /**
     * Gets an instance of the OrderClient.
     * @return OrderClient
     */
    public function getOrderClient(): OrderClient
    {
        return new OrderClient();
    }
}
