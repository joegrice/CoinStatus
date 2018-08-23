import request = require('request-promise');

export class Connect {

    BaseUrl: string = "https://min-api.cryptocompare.com/data/";
    
    public callApi(text: string) {
        var options = {
            uri: this.BaseUrl + text,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response 
        };

        return request(options);
    }
}

export default Connect;