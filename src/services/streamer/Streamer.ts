import express = require("express");
import { Socket } from "socket.io";
import { Price } from "../../models/Price";
import { Connect } from "../../connection/Connect";

const app = express();
const http = require("http").Server(app);
const io: Socket = require("socket.io")(http);

export class Streamer {
    currentPrice: number;

    /**
     *
     */
    constructor() {
        this.socketEvents();
    }

    private socketEvents(): void {
        io.on("connection", socket => {
            this.attachListeners(socket);
        });
    }

    attachListeners(socket: Socket) {
        this.addConenctListner(socket);
        this.addDisconnectListner(socket);
    }

    addConenctListner(socket: Socket) {
        console.log("New client connected");
        setInterval(() => getApiAndEmit(socket), 10000);
    }

    addDisconnectListner(socket: Socket) {
        socket.on("disconnect", socket => console.log("Client disconnected"));
    };

    geta() {
        async socket => {
            try {
                let query = "price?fsym=LTC&tsyms=BTC,ETH,USD,EUR,GBP";
                var apiConnect = new Connect();
                var res = undefined;
                apiConnect.callApi(query).then(function (priceList: Price) {
                    if (priceList != undefined) {
                        res = priceList;
                    }
                    else {
                        res = "NAH";
                    }
                }).catch(function (err) {
                    res = err;
                });
                socket.emit("FromAPI", res.data.currently.temperature); // Emitting a new message. It will be consumed by the client
            } catch (error) {
                console.error(`Error: ${error.code}`);
            }
        };
    }


    start(): void {
        var socket = io.on('https://streamer.cryptocompare.com/');
        //Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
        //Use SubscriptionId 0 for TRADE, 2 for CURRENT, 5 for CURRENTAGG eg use key '5~CCCAGG~BTC~USD' to get aggregated data from the CCCAGG exchange 
        //Full Volume Format: 11~{FromSymbol} eg use '11~BTC' to get the full volume of BTC against all coin pairs
        //For aggregate quote updates use CCCAGG ags market
        var subscription = ['5~CCCAGG~LTC~GBP', '5~CCCAGG~GBP~USD', '11~LTC', '11~GBP'];
        socket.emit('SubAdd', { subs: subscription });
        socket.on("m", function (message) {
            console.log(message);
            /*var messageType = message.substring(0, message.indexOf("~"));
            if (messageType == CCC.STATIC.TYPE.CURRENTAGG) {
                dataUnpack(message);
            }
            else if (messageType == CCC.STATIC.TYPE.FULLVOLUME) {
                decorateWithFullVolume(message);
            }*/
        });
    }

    /*dataUnpack(message) {
        var data = CCC.CURRENT.unpack(message);

        var from = data['FROMSYMBOL'];
        var to = data['TOSYMBOL'];
        var fsym = CCC.STATIC.CURRENCY.getSymbol(from);
        var tsym = CCC.STATIC.CURRENCY.getSymbol(to);
        var pair = from + to;

        if (!currentPrice.hasOwnProperty(pair)) {
            currentPrice[pair] = {};
        }

        for (var key in data) {
            currentPrice[pair][key] = data[key];
        }

        if (currentPrice[pair]['LASTTRADEID']) {
            currentPrice[pair]['LASTTRADEID'] = parseInt(currentPrice[pair]['LASTTRADEID']).toFixed(0);
        }
        currentPrice[pair]['CHANGE24HOUR'] = CCC.convertValueToDisplay(tsym, (currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']));
        currentPrice[pair]['CHANGE24HOURPCT'] = ((currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']) / currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + "%";
        displayData(currentPrice[pair], from, tsym, fsym);
    };*/
}