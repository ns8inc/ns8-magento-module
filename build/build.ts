import { BuildTools } from '@ns8/ns8-protect-sdk';

//Sort all the JSON files to improve readability and reduce conflicts
BuildTools.sortJsonFiles();

//Eventually: Clone the root TS Config down to the sub-projects
//copyFileSync('../tsconfig.json', '../switchboard/tsconfig.json');
//copyFileSync('../tsconfig.json', '../switches/tsconfig.json');
