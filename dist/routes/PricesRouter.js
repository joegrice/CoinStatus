"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Connect_1 = require("../connection/Connect");
class PricesRouter {
    /**
     * Initialize the StatusRouter
     */
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    /**
   * GET all prices
   */
    getLitecoinPrices(req, res, next) {
        let query = "price?fsym=LTC&tsyms=BTC,ETH,USD,EUR,GBP";
        var apiConnect = new Connect_1.Connect();
        apiConnect.callApi(query).then(function (priceList) {
            if (priceList != undefined) {
                res.status(200)
                    .send({
                    message: 'Success',
                    status: res.status,
                    priceList
                });
            }
            else {
                res.status(404)
                    .send({
                    message: 'Problem finding given id.',
                    status: res.status
                });
            }
        }).catch(function (err) {
            res.status(404)
                .send({
                message: 'Problem finding given id.',
                status: res.status,
                err
            });
        });
    }
    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/ltc', this.getLitecoinPrices);
    }
}
exports.PricesRouter = PricesRouter;
exports.default = PricesRouter;
//# sourceMappingURL=../../src/dist/routes/PricesRouter.js.map