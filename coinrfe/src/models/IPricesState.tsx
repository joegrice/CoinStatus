interface IPricesState {
    endpoint: string;
    prices?: Price;
    BTC?: CurrentAgg;
    LTC?: CurrentAgg;
}