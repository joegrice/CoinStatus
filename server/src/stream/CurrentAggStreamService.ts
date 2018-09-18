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
        var subCode: string = '5~CCCAGG~' + subValues[0] + "~" + subValues[1];
        if (!this.subExits(subCode)) {
            this.isNewSubValid(subCode, subValues[0], subValues[1]);
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

    isNewSubValid(subCode: string, from: string, to: string) {
        var valid = false;
        var connect: Connect = new Connect();
        var outerThis = this;
        connect.callApi("all/exchanges").then(function (priceList) {
            for (var priceKey in priceList) {
                if (priceList.hasOwnProperty(priceKey)) {
                    var exchange = priceList[priceKey];
                    for (var exchKey in exchange) {
                        if (exchange.hasOwnProperty(exchKey)) {
                            var currencyArr: string[] = exchange[exchKey] as string[];
                            if (from === exchKey && currencyArr !== undefined && currencyArr.length > 0) {
                                for (var i = 0; i < currencyArr.length; i++) {
                                    if (to === currencyArr[i]) {
                                        outerThis.newSubscriptions.push(subCode);
                                        valid = true;
                                        break;
                                    }
                                }
                            }
                            if (valid) { break; }
                        }
                    }
                    if (valid) { break; }
                }
            }
        }).catch(function (err) {
            console.log(err);
        });
    }

    activateStream(): void {
        this.currentAggs = [];
        var socket = ioClient.connect('https://streamer.cryptocompare.com/');
        socket.emit('SubAdd', { subs: this.subscriptions });
        const streamThis = this;
        socket.on("m", function (message: string) {
            // console.log(message);
            streamThis.checkForNewSubs(socket);
            streamThis.handleStreamMessage(message);
        });
    }

    checkForNewSubs(socket: SocketIOClient.Socket) {
        if (this.newSubscriptions.length > 0) {
            for (var i = 0; i < this.newSubscriptions.length; i++) {
                var subCode: string = this.newSubscriptions[i];
                this.subscriptions.push(subCode);
                var from: string = subCode.split("~")[2];
                this.io.emit("newsocket", from);
                console.log("NEW SUBS ADDED: " + from);
            }
            socket.emit('SubAdd', { subs: this.newSubscriptions });
            this.newSubscriptions = [];
        }
    }

    handleStreamMessage(message: string) {
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
        if (valuesArray.length === 22) {
            const newAgg = new CurrentAgg(message);
            if (newAgg !== undefined) {
                this.currentAggs.push(newAgg);
            } else {
                console.log("New CurrentAgg is invalid.")
            }
        } else {
            this.handleCurrentAggUpdate(valuesArray);
        }
    }

    handleCurrentAggUpdate(valuesArray: string[]): void {
        const currency: string = valuesArray[2];
        const flag: string = valuesArray[4];
        const price: string = valuesArray[5];
        if (flag as CurrentAggFlag === CurrentAggFlag.PRICEUP) {
            this.io.emit(currency + SocketSuffix.UPDATE, currency + "~" + flag + "~" + price);
            // console.log("EMIT: " + currency + SocketSuffix.UPDATE, currency + "~" + flag + "~" + price);
            //console.log(this.getCurrentTime() + " - " + currency + ": PRICE UP ~ " + price);
        } else if (flag as CurrentAggFlag === CurrentAggFlag.PRICEDOWN) {
            this.io.emit(currency + SocketSuffix.UPDATE, currency + "~" + flag + "~" + price);
            // console.log("EMIT: " + currency + SocketSuffix.UPDATE, currency + "~" + flag + "~" + price);
            //console.log(this.getCurrentTime() + " - " + currency + ": PRICE DOWN ~ " + price);
        } else if (flag as CurrentAggFlag === CurrentAggFlag.PRICEUNCHANGED) {
            this.io.emit(currency + SocketSuffix.UPDATE, currency + "~" + flag);
            // console.log("EMIT: " + currency + SocketSuffix.UPDATE, currency + "~" + flag);
            //console.log(this.getCurrentTime() + " - " + currency + ": PRICE UNCHANGED");
        }
    }
}