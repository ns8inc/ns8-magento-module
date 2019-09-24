"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ns8_protect_sdk_1 = require("@ns8/ns8-protect-sdk");
const switchboard_json_1 = __importDefault(require("../switchboard.json"));
const switchboard = switchboard_json_1.default;
ns8_protect_sdk_1.SwitchboardInit.installModules(switchboard);
const createOrderActionHandler = ns8_protect_sdk_1.SwitchboardInit.instantiateHandler(switchboard, 'createOrderAction');
exports.createOrderActionHandler = createOrderActionHandler;
//# sourceMappingURL=app.js.map