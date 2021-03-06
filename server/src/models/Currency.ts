export class Currency {

    private static SYMBOLS = {
        'BTC': 'Ƀ',
        'LTC': 'Ł',
        'DAO': 'Ð',
        'USD': '$',
        'CNY': '¥',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'PLN': 'zł',
        'RUB': '₽',
        'ETH': 'Ξ',
        'GOLD': 'Gold g',
        'INR': '₹',
        'BRL': 'R$'
    };

    public static get(currency: string) {
        return this.SYMBOLS[currency] || currency;
    }
}