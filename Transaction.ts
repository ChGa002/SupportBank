import moment, {Moment} from "moment";

export class Transaction {
    static dateFormat: string = "DD/MM/YYYY"
    amount: number;
    date?: Moment;
    narrative?: string;


    constructor(amount: number, date?: Moment, narrative?: string) {
        this.validate(amount, date);
        this.amount = amount;
        this.date = date;
        this.narrative = narrative;
    }

    getTransactionInfo()
    {
        let info = this.date?.toString();
        if (this.amount < 0)
        {
            info += " -£" + -this.amount;
        } else
        {
            info += " £" + this.amount;
        }
        return info + " for " + this.narrative;
    }

    private validate(amount: number, date?: Moment)
    {
        if (isNaN(Number(amount)))
        {
           throw TypeError("The amount '" + amount + "' is not a valid number.");
        }

        if (date && !moment(date, Transaction.dateFormat).isValid())
        {
           throw Error("The following '" + date + "' is not a date of the form " + Transaction.dateFormat);
        }

    }

}