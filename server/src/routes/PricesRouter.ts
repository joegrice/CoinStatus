import { Router, Request, Response, NextFunction } from 'express';
import { Connect } from "../connection/Connect";
import { Price } from '../models/Price';

export class PricesRouter {
    router: Router
    status: string

    /**
     * Initialize the StatusRouter
     */
    constructor() {
        this.router = Router();
        this.init();
    }

    /**
   * GET all prices
   */
    public getLitecoinPrices(req: Request, res: Response, next: NextFunction) {
        let query = "price?fsym=LTC&tsyms=BTC,ETH,USD,EUR,GBP";
        var apiConnect = new Connect();
        apiConnect.callApi(query).then(function (priceList: Price) {
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

export default PricesRouter;