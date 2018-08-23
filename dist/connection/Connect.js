"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
class Connect {
    constructor() {
        this.BaseUrl = "https://min-api.cryptocompare.com/data/";
    }
    callApi(text) {
        var options = {
            uri: this.BaseUrl + text,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response 
        };
        return request(options);
    }
}
exports.Connect = Connect;
exports.default = Connect;
//# sourceMappingURL=../../src/dist/connection/Connect.js.map