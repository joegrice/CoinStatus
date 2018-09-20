import { CurrentAggFlag } from "./CurrentAggFlag";
import { Currency } from "./Currency";

// '{SubscriptionId}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{LastMarket}'
// FLAG - 1-PRICEUP, 2-PRICEDOWN, 4-PRICEUNCHANGED
export class CurrentAgg {
    public SubscriptionId: number;
    public ExchangeName: string;
    public FromCurrency: string;
    public FromSymbol: string;
    public ToCurrency: string;
    public ToSymbol: string;    
    public Flag: CurrentAggFlag;
    public Price: number;
    public LastUpdate: number;
    public LastVolume: number;
    public LastVolumeTo: number;
    public LastTradeId: number;
    public Volume24h: number;
    public Volume24hTo: number;
    public LastMarket: number;

    constructor(message: string) {
        this.unpackMessage(message);
    }

    unpackMessage(message): void {
        var valuesArray = message.split("~");
        this.FromCurrency = valuesArray[2];
        this.FromSymbol = Currency.get(this.FromCurrency);
        this.ToCurrency = valuesArray[3];
        this.ToSymbol = Currency.get(this.ToCurrency);
        this.Flag = valuesArray[4];
        this.Price = valuesArray[5];
      }
}