<?php

namespace NS8\Protect\Api\Data;

use Magento\Framework\Api\ExtensionAttributesInterface;

interface Eq8ScoreInterface extends ExtensionAttributesInterface
{
    const FIELD_NAME = 'eq8_score';
    const VALUE = 'eq8_score';

    /**
     * Return value.
     *
     * @return string|null
     */
    public function getValue();

    /**
     * Set value.
     *
     * @param string|null $value
     * @return $this
     */
    public function setValue($value);
}
