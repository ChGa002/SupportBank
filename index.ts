import * as path from "path";
import {Employee} from "./Employee";
import moment from "moment";

const fs = require('fs');
const csv = require('csv-parser');

// logging
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";
logger.debug("Some debug messages");

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

// chosen mode ListAll or ListOne
enum Mode {ListAll, ListOne}

let chosenMode: Mode = Mode.ListAll;
let chosenName = "";

// csv file names
const goodFile = "Transactions2014.csv";
const badFile = "DodgyTransactions2015.csv";

let rawCsvData: any[] = [];
let employees: Array<Employee> = [];

// Waits for input from user to set mode
const readlineSync = require('readline-sync');
setMode(readlineSync.question('Please select ListAll mode or List [Name] mode '));

// parseCsvAndOutput(goodFile);
parseCsvAndOutput(badFile);


function parseCsvAndOutput(fileName : string)
{
    const csvFilePath = path.resolve(fileName);

    fs.createReadStream(csvFilePath)
        .pipe(csv(true))
        .on('data', function(data :any){
            try {
                rawCsvData.push(data);
            }
            catch(error) {
                const errorMessage = "There was an error while reading the csv file: " + csvFilePath + "\n" + error;
                logger.error(errorMessage);
                throw Error (errorMessage);
            }
        })
        .on('end',function(){
            if (chosenMode == Mode.ListAll) listAll(rawCsvData)
            else listOne(rawCsvData, chosenName);

            outputToConsole();
        });
}


function outputToConsole()
{
    if (chosenMode == Mode.ListAll)
    {
        listAllOutput();
    } else
    {
        listOneOutput();
    }
}

function listAll(lines: any[]) {

    // Fill up employees array with minimal info
    lines.forEach(function(entry, index) {

        try {
            // Money owed to this employee
            let indexOfEmployee = getIndexOfEmployee(entry.From)
            if (indexOfEmployee === -1) {
                let newEmployee = new Employee(entry.From);
                newEmployee.addTransaction(entry.Amount);
                employees.push(newEmployee);
            } else {
                employees[indexOfEmployee].addTransaction(entry.Amount);
            }

            // Money this employee owes
            indexOfEmployee = getIndexOfEmployee(entry.To)
            if (indexOfEmployee === -1) {
                let newEmployee = new Employee(entry.To);
                newEmployee.addTransaction(-entry.Amount);
                employees.push(newEmployee);
            } else {
                employees[indexOfEmployee].addTransaction(-entry.Amount);
            }
        } catch (error)
        {
            const errorMessage = "Line " + Number(index + 2) + " of the csv contained the following error: \n" + error;
            logger.error(errorMessage);
            throw (errorMessage);
        }

    })
}

function listAllOutput()
{
    employees.forEach(employee => {
        console.log(employee.getSimpleInformation())
    })
}


function listOne(lines: any[], chosenName: string) {

    let employee = new Employee(chosenName);

    lines.forEach(function(entry, index) {
        try {
            if (entry.From == chosenName) {
                employee.addTransaction(entry.Amount, entry.Date, entry.Narrative);
            } else if (entry.To == chosenName) {
                employee.addTransaction(-entry.Amount, entry.Date, entry.Narrative);
            }
        }
        catch (error){
            const errorMessage = "Line " + Number(index + 2) + " of the csv contained the following error: \n" + error;
            logger.error(errorMessage);
            throw (errorMessage);
        }

    })

    employees.push(employee);
}


function listOneOutput()
{
    employees[0].transactions.forEach(transaction => console.log(transaction.getTransactionInfo()));
}


function setMode(input: string) {
    if (input === "ListAll") {
        chosenMode = Mode.ListAll;
    } else {
        chosenMode = Mode.ListOne;
        chosenName = input.split("List ")[1];
    }
}

// Checks to see if employee already exists in array employees
function getIndexOfEmployee(name: string) {
    return employees.findIndex((element) => (element.name == name));
}

