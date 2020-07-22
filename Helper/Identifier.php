<?php

namespace NS8\Protect\Helper;

use Magento\Customer\Model\Session as CustomerSession;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\HTTP\Header;
use Magento\Framework\HTTP\PhpEnvironment\Request;
use Magento\Framework\Session\SessionManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Helper Utility for generating, managing, and validating Identifiers
 */
class Identifier extends AbstractHelper
{
    /**
     * Generates a UUID
     *
     * @return string - A string containing a UUID
     */
    public function generateUUID(): string
    {
        if (function_exists('com_create_guid')) {
            $merchantId = trim(com_create_guid(), '{}');
        } else {
            $charid = strtoupper(hash('sha512', uniqid(rand(), true)));
            $hyphen = '-';
            $merchantIdPieces = [
            substr($charid, 0, 8),
            substr($charid, 8, 4),
            substr($charid, 12, 4),
            substr($charid, 16, 4),
            substr($charid, 20, 12)
            ];
            $merchantId = implode($merchantIdPieces, '-');
        }

        return $merchantId;
    }
}
