export class SubCode {

    from: string;
    to: string;

    constructor(from: string, to: string) {
        this.from = from;
        this.to = to;        
    }

    getSubCode(): string {
        return '5~CCCAGG~' + this.from + "~" + this.to;
    }

    getFrom(): string {
        return this.from;
    }

    getTo(): string {
        return this.to;
    }
}