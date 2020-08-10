<?php

namespace NS8\Protect\Helper\Data;

class ProtectMetadata
{
    /** @var string */
    public $token;
    /** @var bool */
    public $isActive;

    public function __construct(?string $token, bool $isActive)
    {
        $this->token = $token;
        $this->isActive = $isActive;
    }
}
