import {Transaction} from "./Transaction";

export class Employee {
    name: string;
    transactions: Transaction[];

    constructor(name: string) {
        this.name = name;
        this.transactions = [];
    }


    getBalance(): number {
        let balance: number = 0;
        this.transactions.forEach(transaction => {
            balance = balance + Number(transaction.amount);
        })
        return Math.round(balance);
    }

    addTransaction(amount: number, date?: any, narrative?: string) {
        let newTransaction = new Transaction(amount, date, narrative);
        this.transactions.push(newTransaction);
    }

    getSimpleInformation(): string {
        let info: string = this.name;

        let balance: number = this.getBalance();
        if (balance < 0) {
            info += " owes £" + -balance;
        } else if (balance > 0) {
            info += " is owed £" + balance;
        } else {
            info += " is all settled up.";
        }

        return info;
    }
}