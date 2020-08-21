<?php
namespace NS8\Protect\Test\Mock;

use Magento\Framework\DB\Adapter\AdapterInterface;

class MockConnection
{
    public function quoteTableAs($tableName): ?string
    {
        return $tableName;
    }

    public function query($query, $params): void
    {
      // no-op
    }
}
