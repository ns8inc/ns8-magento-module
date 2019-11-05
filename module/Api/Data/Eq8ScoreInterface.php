<?php

namespace NS8\Protect\Api\Data;

interface Eq8ScoreInterface
{
    const FIELD_NAME = 'eq8_score';
    const VALUE = self::FIELD_NAME;

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
