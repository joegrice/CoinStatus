// '{SubscriptionId}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{LastMarket}'
class CurrentAgg {
    public SubscriptionId: number;
    public ExchangeName: string;
    public FromCurrency: string;
    public FromSymbol: string;
    public ToCurrency: string;
    public ToSymbol: string;
    public Flag: string;
    public Price: number;
    public LastUpdate: number;
    public LastVolume: number;
    public LastVolumeTo: number;
    public LastTradeId: number;
    public Volume24h: number;
    public Volume24hTo: number;
    public LastMarket: number;
}