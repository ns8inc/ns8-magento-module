<?php
namespace NS8\Protect\Test\Mock;

use Magento\Sales\Model\Order;

class MockOrder extends Order
{
    public function __construct(array $data)
    {
        $this->_data = $data;
    }

    public function setHasDataChanges($flag): MockOrder
    {
        return $this;
    }

    public function save(): void
    {
        // no-op
    }
}
