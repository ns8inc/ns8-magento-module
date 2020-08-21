<?php
namespace NS8\Protect\Helper;

use NS8\ProtectSDK\Order\Client as OrderClient;

class Protect
{
    public function getOrderClient(): OrderClient
    {
        return new OrderClient();
    }
}
