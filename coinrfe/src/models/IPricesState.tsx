interface IPricesState {
    endpoint: string;
    prices?: Price;
    currentAggs?: CurrentAgg[];
    newSub?: string;
}