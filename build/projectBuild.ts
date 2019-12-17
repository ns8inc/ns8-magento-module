/* eslint-disable no-console */
import { BuildTools } from '@ns8/ns8-protect-sdk';

// Sort all the JSON files to improve readability and reduce conflicts
BuildTools.sortJsonFiles();
console.info('Alpha-sorted all JSON files');
