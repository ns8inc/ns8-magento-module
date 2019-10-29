<?php

namespace NS8\Protect\Test\Unit;

use NS8\Protect\Helper\Logger;

class ConfigTest extends \PHPUnit\Framework\TestCase
{
    protected $objectManager;
    protected $logger;

    /**
     * Is called once before running all test in class
     */
    public static function setUpBeforeClass()
    {
    }

    /**
     * Is called once after running all test in class
     */
    public static function tearDownAfterClass()
    {
    }

    /**
     * Is called before running a test
     */
    protected function setUp()
    {
        $this->objectManager = new \Magento\Framework\TestFramework\Unit\Helper\ObjectManager($this);
        $this->logger = $this->objectManager->getObject("NS8\Protect\Helper\Logger");
    }

    /**
     * Is called after running a test
     */
    protected function tearDown()
    {
    }

    /**
     * The test itself, every test function must start with 'test'
     */
    public function testTest()
    {
        $this->assertTrue($this->logger->debug('message'));
    }
}
