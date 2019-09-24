"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const minimist_1 = __importDefault(require("minimist"));
const destFolder = 'module/etc/integration';
const configDest = `${destFolder}/config.xml`;
const apiDest = `${destFolder}/api.xml`;
const placeConfig = (env) => {
    if (env !== 'dev' && env !== 'prod') {
        console.error(env);
        throw new Error('No matching env');
    }
    if (!fs_1.existsSync(destFolder)) {
        fs_1.mkdirSync(destFolder, {
            recursive: true,
        });
    }
    fs_1.copyFileSync(`build/module/etc/integration/config.${env}.xml`, configDest);
    fs_1.copyFileSync(`build/module/etc/integration/api.${env}.xml`, apiDest);
};
const args = minimist_1.default(process.argv.slice(2));
const { env } = args;
placeConfig(env);
//# sourceMappingURL=config.js.map