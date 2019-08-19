var fs = require("fs");
var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: "root",
    password: "",
    database: "StoreFront_db"
});

connection.connect(function (err,) {
    if (err) throw err;
    firstPrompt();
})

function firstPrompt() {

    inquirer.prompt([

        {
            name: "confirm",
            type: "confirm",
            message: "The shop sign reads:  FUTURE PET EMPORIUM. Would you like to enter through the front door?",
            default: true
        },

    ]).then(function (answer) {
        if (answer.confirm) shop();
        else { console.log("Ok, come back soon!") }
    })

    function shop() {
        console.log(" ");
        console.log("Thank you for visiting our facility, and congratulations on making the choice to improve your domesticated friends. Here You'll find everything you need for your GEP (Genetically Enhanced Pet) to thrive!");
        console.log(" ");
        connection.query("SELECT * FROM items", function (err, data) {
            if (err) throw err;
            displayPrompt(data);
        })
    }

    function displayPrompt(data) {
        console.table(data);
        inquirer.prompt([

            {
                name: "item",
                message: "which item would you like to add? Please Enter The ID # -->",
                type: "input"
            }

        ]).then(function (ID) {
            connection.query(("SELECT quantity,product_name,price FROM items WHERE items.id=" + ID.item), function (err, response) {
                if (err) throw err;
                console.table(response);
                quantityPrompt(ID);

            })
        })
    }

    function quantityPrompt(ID) {
        connection.query(("SELECT quantity,price FROM items WHERE items.id=" + ID.item), function (err, response) {
            console.log("We currently have " + response[0].quantity + " in stock, which cost " + response[0].price + " Credits each.");
            if (err) throw err;
            inquirer.prompt([
                {
                    name: "quantity",
                    message: "How many would you like?",
                    type: "input"
                }
            ]).then(function (quantity) {
                console.log("entered " + quantity.quantity);
            })
        })
    }
    // connection.end();
}
