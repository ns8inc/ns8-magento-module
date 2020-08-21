<?php
namespace NS8\Protect\Test\Mock;

use Magento\Sales\Model\Order;

class MockOrder extends Order
{
    public function __construct(array $data)
    {
        $this->_data = $data;
    }

    public function setData($key, $value = null): MockOrder
    {
        $this->_data[$key] = $value;

        return $this;
    }

    public function save()
    {
        // no-op
    }
}
