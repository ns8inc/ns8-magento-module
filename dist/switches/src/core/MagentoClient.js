"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const magento2_rest_client_1 = require("@ns8/magento2-rest-client");
const dotenv_1 = require("dotenv");
dotenv_1.config();
exports.MagentoClient = new magento2_rest_client_1.RestClient({
    url: process.env.URL,
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET
});
//# sourceMappingURL=MagentoClient.js.map