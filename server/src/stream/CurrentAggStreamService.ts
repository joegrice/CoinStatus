//Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
//Use SubscriptionId 0 for TRADE, 2 for CURRENT, 5 for CURRENTAGG eg use key '5~CCCAGG~BTC~USD' to get aggregated data from the CCCAGG exchange 
//Full Volume Format: 11~{FromSymbol} eg use '11~BTC' to get the full volume of BTC against all coin pairs
//For aggregate quote updates use CCCAGG ags market
import * as ioClient from 'socket.io-client';
import socketIo = require("socket.io");
import { CurrentAgg } from '../models/CurrentAgg';
import { CurrentAggFlag } from '../models/CurrentAggFlag';
import { SocketSuffix } from '../models/SocketSuffix';
import { Connect } from '../connection/Connect';
import { SubCode } from '../models/SubCode';

export class CurrentAggStreamService {

    io: socketIo.Server;
    newSubscriptions: string[] = [];
    subscriptions: string[] = ['5~CCCAGG~BTC~USD', '5~CCCAGG~LTC~USD'];
    currentAggs: CurrentAgg[];

    constructor(ioInput: SocketIO.Server) {
        this.io = ioInput;
    }

    addNewSub(message: string): boolean {
        var added: boolean = false;
        var subValues: string[] = message.split("~");
        var subCode: SubCode = new SubCode(subValues[0], subValues[1]);
        if (!this.subExits(subCode.getSubCode())) {
            this.checkSubIsValid(subCode);
        }
        return added;
    }

    subExits(subCode: string): boolean {
        var exists: boolean = false;
        for (var i = 0; i < this.subscriptions.length; i++) {
            if (this.subscriptions[i] === subCode) {
                exists = true;
            }
        }
        return exists;
    }

    checkSubIsValid(subCode: SubCode) {
        var connect: Connect = new Connect();
        var outerThis = this;
        connect.callApi("all/exchanges").then(function (priceList) {
            var subSearch: boolean = outerThis.searchExchanges(subCode, priceList);
            if (subSearch === true) {
                outerThis.newSubscriptions.push(subCode.getSubCode());
            }
        }).catch(function (err) {
            console.log(err);
        });
    }

    searchExchanges(subCode: SubCode, priceList: Object): boolean {
        var valid: boolean = false;
        for (var priceKey in priceList) {
            if (priceList.hasOwnProperty(priceKey)) {
                var exchange = priceList[priceKey];
                valid = this.searchFromCurrencies(subCode, exchange);
            }
            if (valid) { break; }
        }
        return valid;
    }

    searchFromCurrencies(subCode: SubCode, exchange: Object[]): boolean {
        var valid: boolean = false;
        for (var exchKey in exchange) {
            if (exchange.hasOwnProperty(exchKey)) {
                var currencyArr: string[] = exchange[exchKey] as string[];
                if (subCode.getFrom() === exchKey && currencyArr !== undefined && currencyArr.length > 0) {
                    valid = this.searchToCurrencies(subCode, currencyArr);
                }
            }
            if (valid) { break; }
        }
        return valid;
    }

    searchToCurrencies(subCode: SubCode, currencyArr: string[]): boolean {
        var valid: boolean = false;
        for (var i = 0; i < currencyArr.length; i++) {
            if (subCode.getTo() === currencyArr[i]) {
                valid = true;
                break;
            }
        }
        return valid;
    }

    activateStream(): void {
        this.currentAggs = [];
        var socket = ioClient.connect('https://streamer.cryptocompare.com/');
        socket.emit('SubAdd', { subs: this.subscriptions });
        const outerThis = this;
        socket.on("m", function (message: string) {
            outerThis.checkForNewSubs(socket);
            outerThis.handleStreamMessage(message);
        });
    }

    checkForNewSubs(socket: SocketIOClient.Socket): void {
        if (this.newSubscriptions.length > 0) {
            for (var i = 0; i < this.newSubscriptions.length; i++) {
                var subCode: string = this.newSubscriptions[i];
                this.subscriptions.push(subCode);
                var from: string = subCode.split("~")[2];
                this.io.emit("newsocket", from);
                console.log("NEW SUBS ADDED: " + from);
            }
            // Send new subs to API
            socket.emit('SubAdd', { subs: this.newSubscriptions });
            this.newSubscriptions = [];
        }
    }

    handleStreamMessage(message: string): void {
        var messageType = message.substring(0, message.indexOf("~"));
        switch (messageType) {
            case "3":
                this.sendCurrentAggs();
                break;
            case "5":
                this.emitCurrentAgg(message);
                break;
            default:
                console.log("Message type " + messageType + " not found.");
                console.log(message);
                break;
        }
    }

    getCurrentTime(): string {
        const time = new Date();
        var hh = time.getHours();
        var mm = time.getMinutes();
        var ss = time.getSeconds();
        return hh + ":" + mm + ":" + ss;
    }

    sendCurrentAggs(): void {
        this.io.emit("currentAggs", this.currentAggs);
    }

    emitCurrentAgg(message: string): void {
        var valuesArray = message.split("~");
        const newAgg = new CurrentAgg(message);
        if (valuesArray.length === 22) {
            if (newAgg !== undefined) {
                this.currentAggs.push(newAgg);
            } else {
                console.log("New CurrentAgg is invalid.")
            }
        } else {
            this.handleCurrentAggUpdate(newAgg);
        }
    }

    handleCurrentAggUpdate(newAgg: CurrentAgg): void {
        if (newAgg.Flag as CurrentAggFlag === CurrentAggFlag.PRICEUP) {
            this.io.emit(newAgg.FromCurrency + SocketSuffix.UPDATE, newAgg.FromCurrency + "~" + newAgg.Flag + "~" + newAgg.Price);
        } else if (newAgg.Flag as CurrentAggFlag === CurrentAggFlag.PRICEDOWN) {
            this.io.emit(newAgg.FromCurrency + SocketSuffix.UPDATE, newAgg.FromCurrency + "~" + newAgg.Flag + "~" + newAgg.Price);
        } else if (newAgg.Flag as CurrentAggFlag === CurrentAggFlag.PRICEUNCHANGED) {
            this.io.emit(newAgg.FromCurrency + SocketSuffix.UPDATE, newAgg.FromCurrency + "~" + newAgg.Flag);
        }
    }
}