//Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
//Use SubscriptionId 0 for TRADE, 2 for CURRENT, 5 for CURRENTAGG eg use key '5~CCCAGG~BTC~USD' to get aggregated data from the CCCAGG exchange 
//Full Volume Format: 11~{FromSymbol} eg use '11~BTC' to get the full volume of BTC against all coin pairs
//For aggregate quote updates use CCCAGG ags market
import * as ioClient from 'socket.io-client';
import socketIo = require("socket.io");
import { CurrentAgg } from '../models/CurrentAgg';
import { CurrentAggFlag } from '../models/CurrentAggFlag';
import { SocketSuffix } from '../models/SocketSuffix';

export class CurrentAggStreamService {

    io: socketIo.Server;
    subscriptions: string[] = ['5~CCCAGG~BTC~USD', '5~CCCAGG~LTC~USD'];

    constructor(ioInput: SocketIO.Server) {
        this.io = ioInput;
    }

    activateStream(): void {
        var socket = ioClient.connect('https://streamer.cryptocompare.com/');
        socket.emit('SubAdd', { subs: this.subscriptions });
        const streamThis = this;
        socket.on("m", function (message: string) {
            streamThis.handleStreamMessage(message);
        });
    }

    handleStreamMessage(message: string) {
        var messageType = message.substring(0, message.indexOf("~"));
        switch (messageType) {
            case "5":
                this.emitCurrentAgg(message);
                break;
            default:
                console.log("Message type " + messageType + " not found.");
        }
    }

    getCurrentTime(): string {
        const time = new Date();
        var hh = time.getHours();
        var mm = time.getMinutes();
        var ss = time.getSeconds()
        return hh + ":" + mm + ":" + ss;
    }

    emitCurrentAgg(message: string): void {
        var valuesArray = message.split("~");
        if (valuesArray.length === 21) {
            const newAgg = new CurrentAgg(message);
            if (newAgg != undefined) {
                this.io.emit(newAgg.FromCurrency + SocketSuffix.ADD, newAgg);
                console.log(newAgg.FromCurrency + " - " + newAgg.ToCurrency + " - " + newAgg.Price + " - " + newAgg.Flag);
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
            this.io.emit(currency + SocketSuffix.UPDATE, flag + "~" + price);
            console.log(this.getCurrentTime() + " - " + currency + ": PRICE UP ~ " + price);
        } else if (flag as CurrentAggFlag === CurrentAggFlag.PRICEDOWN) {
            this.io.emit(currency + SocketSuffix.UPDATE, flag + "~" + price);
            console.log(this.getCurrentTime() + " - " + currency + ": PRICE DOWN ~ " + price);
        } else if (flag as CurrentAggFlag === CurrentAggFlag.PRICEUNCHANGED) {
            this.io.emit(currency + SocketSuffix.UNCHANGED, flag);
            console.log(this.getCurrentTime() + " - " + currency + ": PRICE UNCHANGED");
        }
    }
}