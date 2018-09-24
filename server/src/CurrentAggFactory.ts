import { CurrentAgg } from "./models/CurrentAgg";
import { Currency } from "./models/Currency";

export class CurrentAggFactory {

    private message: string;
    private FIELDS = {
        'TYPE': 0x0       // hex for binary 0, it is a special case of fields that are always there
        , 'MARKET': 0x0       // hex for binary 0, it is a special case of fields that are always there
        , 'FROMSYMBOL': 0x0       // hex for binary 0, it is a special case of fields that are always there
        , 'TOSYMBOL': 0x0       // hex for binary 0, it is a special case of fields that are always there
        , 'FLAGS': 0x0       // hex for binary 0, it is a special case of fields that are always there
        , 'PRICE': 0x1       // hex for binary 1
        , 'BID': 0x2       // hex for binary 10
        , 'OFFER': 0x4       // hex for binary 100
        , 'LASTUPDATE': 0x8       // hex for binary 1000
        , 'AVG': 0x10      // hex for binary 10000
        , 'LASTVOLUME': 0x20      // hex for binary 100000
        , 'LASTVOLUMETO': 0x40      // hex for binary 1000000
        , 'LASTTRADEID': 0x80      // hex for binary 10000000
        , 'VOLUMEHOUR': 0x100     // hex for binary 100000000
        , 'VOLUMEHOURTO': 0x200     // hex for binary 1000000000
        , 'VOLUME24HOUR': 0x400     // hex for binary 10000000000
        , 'VOLUME24HOURTO': 0x800     // hex for binary 100000000000
        , 'OPENHOUR': 0x1000    // hex for binary 1000000000000
        , 'HIGHHOUR': 0x2000    // hex for binary 10000000000000
        , 'LOWHOUR': 0x4000    // hex for binary 100000000000000
        , 'OPEN24HOUR': 0x8000    // hex for binary 1000000000000000
        , 'HIGH24HOUR': 0x10000   // hex for binary 10000000000000000
        , 'LOW24HOUR': 0x20000   // hex for binary 100000000000000000
        , 'LASTMARKET': 0x40000   // hex for binary 1000000000000000000, this is a special case and will only appear on CCCAGG messages
    };

    constructor(message: string) {
        this.message = message;
    }

    newCurrentAgg(): CurrentAgg {
        var res: Object = this.unpackMessage();
        var agg: CurrentAgg = this.unpackObject(res);
        return agg;
    }

    updateAgg(currentAgg: CurrentAgg): CurrentAgg {
        var res: Object = this.unpackMessage();
        this.unpackExistingObject(currentAgg, res);
        return currentAgg;
    }


    unpackObject(unpacked: Object): CurrentAgg {
        var currentAgg: CurrentAgg = new CurrentAgg();
        for (var key in unpacked) {
            if (unpacked.hasOwnProperty(key)) {
                this.updateProperty(currentAgg, unpacked, key);
            }
        }
        return currentAgg;
    }

    unpackExistingObject(currentAgg: CurrentAgg, unpacked: Object): void {
        for (var key in unpacked) {
            if (unpacked.hasOwnProperty(key)) {
                this.updateProperty(currentAgg, unpacked, key);
            }
        }
    }

    updateProperty(currentAgg: CurrentAgg, unpacked: Object, key: string) {
        switch (key) {
            case `TYPE`: currentAgg.TYPE = unpacked[unpacked[key]]; break;
            case `MARKET`: currentAgg.MARKET = unpacked[key]; break;
            case `FROMSYMBOL`: currentAgg.FROMCURRENCY = unpacked[key];
                currentAgg.FROMSYMBOL = Currency.get(unpacked[key]); break;
            case `TOSYMBOL`: currentAgg.TOCURRENCY = unpacked[key];
                currentAgg.TOSYMBOL = Currency.get(unpacked[key]); break;
            case `FLAGS`: currentAgg.FLAGS = unpacked[key]; break;
            case `PRICE`: currentAgg.PRICE = unpacked[key]; break;
            case `BID`: currentAgg.BID = unpacked[key]; break;
            case `OFFER`: currentAgg.OFFER = unpacked[key]; break;
            case `LASTUPDATE`: currentAgg.LASTUPDATE = unpacked[key]; break;
            case `AVG`: currentAgg.AVG = unpacked[key]; break;
            case `LASTVOLUME`: currentAgg.LASTVOLUME = unpacked[key]; break;
            case `LASTVOLUMETO`: currentAgg.LASTVOLUMETO = unpacked[key]; break;
            case `LASTTRADEID`: currentAgg.LASTTRADEID = unpacked[key]; break;
            case `VOLUMEHOUR`: currentAgg.VOLUMEHOUR = unpacked[key]; break;
            case `VOLUMEHOURTO`: currentAgg.VOLUMEHOURTO = unpacked[key]; break;
            case `VOLUME24HOUR`: currentAgg.VOLUME24HOUR = unpacked[key]; break;
            case `VOLUME24HOURTO`: currentAgg.VOLUME24HOURTO = unpacked[key]; break;
            case `OPENHOUR`: currentAgg.OPENHOUR = unpacked[key]; break;
            case `HIGHHOUR`: currentAgg.HIGHHOUR = unpacked[key]; break;
            case `LOWHOUR`: currentAgg.LOWHOUR = unpacked[key]; break;
            case `OPEN24HOUR`: currentAgg.OPEN24HOUR = unpacked[key]; break;
            case `HIGH24HOUR`: currentAgg.HIGH24HOUR = unpacked[key]; break;
            case `LOW24HOUR`: currentAgg.LOW24HOUR = unpacked[key]; break;
            case `LASTMARKET`: currentAgg.LASTMARKET = unpacked[key]; break;
            default: 'Property not found.'; break;
        }
    }

    unpackMessage() {
        var valuesArray = this.message.split("~");
        var valuesArrayLenght = valuesArray.length;
        var mask = valuesArray[valuesArrayLenght - 1];
        var maskInt = parseInt(mask, 16);
        var unpackedCurrent = {};
        var currentField = 0;
        for (var property in this.FIELDS) {
            if (this.FIELDS[property] === 0) {
                unpackedCurrent[property] = valuesArray[currentField];
                currentField++;
            }
            else if (maskInt & this.FIELDS[property]) {
                if (property === 'LASTMARKET') {
                    unpackedCurrent[property] = valuesArray[currentField];
                } else {
                    unpackedCurrent[property] = parseFloat(valuesArray[currentField]);
                }
                currentField++;
            }
        }

        return unpackedCurrent;
    }
}