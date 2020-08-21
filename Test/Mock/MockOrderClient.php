<?php
namespace NS8\Protect\Test\Mock;

use NS8\ProtectSDK\Order\Client as OrderClient;

class MockOrderClient extends OrderClient
{
    /** @var \stdClass[] */
    public static $orders = [];

    public static function getOrderByName(string $name): \stdClass
    {
        foreach (MockOrderClient::$orders as $order) {
            if ($order->name === $name) {
                return $order;
            }
        }
        throw new \Error("not found");
    }

    public static function setOrders(array $orders): void
    {
        MockOrderClient::$orders = json_decode(json_encode($orders));
    }
}
