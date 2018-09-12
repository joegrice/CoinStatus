import { CurrentAggFlag } from "./CurrentAggFlag";

// '{SubscriptionId}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{LastMarket}'
// FLAG - 1-PRICEUP, 2-PRICEDOWN, 4-PRICEUNCHANGED
export class CurrentAgg {
    public SubscriptionId: number;
    public ExchangeName: string;
    public FromCurrency: string;
    public ToCurrency: string;
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
        this.ToCurrency = valuesArray[3];
        this.Flag = valuesArray[4];
        this.Price = valuesArray[5];
      }
}