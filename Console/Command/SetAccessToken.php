<?php
namespace NS8\Protect\Console\Command;

use NS8\Protect\Helper\Config;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Class SetAccessToken
 *
 * sets the access token in the store metadata config
 */
class SetAccessToken extends Command
{
    const STORE_ID = 'store';
    const TOKEN = 'token';
    const ACTIVE = 'active';

    /**
     * @inheritDoc
     */
    public function __construct(Config $config)
    {
        $this->config = $config;
        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    protected function configure(): void
    {
        $this->setName('protect:token:set');
        $this->setDescription('overwrites a store\'s installed access token');
        $this->addOption(
            self::STORE_ID,
            null,
            InputOption::VALUE_REQUIRED,
            'store id'
        );
        $this->addOption(
            self::ACTIVE,
            null,
            InputOption::VALUE_REQUIRED,
            'is the merchant active'
        );
        $this->addArgument(
            self::TOKEN,
            InputArgument::REQUIRED,
            'Protect token'
        );

        parent::configure();
    }

    /**
     * Execute sets the store's access token
     *
     * @param InputInterface $input
     * @param OutputInterface $output
     *
     * @return void
     */
    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        $storeId = $input->getOption(self::STORE_ID);
        $token = $input->getArgument(self::TOKEN);
        $active = $input->getOption(self::ACTIVE);

        $this->config->setAccessToken($storeId, $token);
        if ($active !== null) {
            $this->config->setIsMerchantActive($storeId, $active === 'true');
        }
        $output->writeln('<info>Access token overwritten.</info>');
    }
}
