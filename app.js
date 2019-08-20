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

connection.connect(function (err, ) {
    if (err) throw err;
    firstPrompt();
})

function firstPrompt() {

    inquirer.prompt([

        {
            name: "confirm",
            type: "confirm",
            message: "The shop sign reads: 'Future Pet Emporium.' Shop Here?",
            default: true
        },

    ]).then(function (answer) {
        if (answer.confirm) {
            console.log(" ");
            console.log("You are greeted by a soft voice. 'Thank you for visiting our facility, and congratulations on making the choice to improve your domesticated friends. Here you'll find everything you need for your GEP (Genetically Enhanced Pet) to thrive!'");
            console.log(" ");
            shop();
        }

        else { console.log("Ok, come back soon!") }
    })

    function shop() {
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
                message: "which item would you like to purchase? Please Enter The ID # -->",
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
                    console.log(" ")
                    var qty = quantity.quantity;
                if (qty < 1 || qty > response[0].quantity) {
                    console.log("We would love to provide you with " + qty + ". However that is not a valid input. Our stockroom is currently holding " + response[0].quantity + ". Please re-submit your order with a valid total.");
                    shop();
                     }
                 else if (qty <= response[0].quantity) {
                    console.log("You've entered " + quantity.quantity
                        + "." + " Total Sale will be " +
                        (quantity.quantity * response[0].price) +
                        " Credits. Are you sure?");

                    inquirer.prompt([
                        {
                            name: "confirm",
                            type: "confirm",
                            message: "Please Confirm Purchase: "

                        }
                    ]).then(function (resp) {
                        console.log(" ");

                        if (resp.confirm === true) {
                            saleComplete(ID, qty, response);
                            function saleComplete(ID) {

                                console.log("Thank you, and enjoy!");
                                console.log(" ");
                                var cost = quantity.quantity * response[0].price;
                                // console.log(ID.item);
                                // console.log(qty);
                                // console.log(response[0].quantity);
                                // console.log(response[0].quantity - qty);

                                connection.query(("UPDATE items SET quantity = " + (response[0].quantity - qty) + " WHERE items.id = " + ID.item), function (err) {
                                    if (err) throw err
                                });

                                inquirer.prompt([
                                    {
                                        name: "afterSale",
                                        message: cost + " Credits have been charged to your Future Pet Account. What Next?",
                                        type: "list",
                                        choices: ["Browse the shop again", "Exit the store"]
                                    }

                                ]).then(function (answer) {
                                    if (answer.afterSale === "Browse the shop again") {
                                        console.log(" ");
                                        console.log("Here Is Our Updated Inventory...");
                                        console.log(" ");
                                        shop();
                                    }
                                    else {
                                        console.log("Thank you for visiting! We hope you and your GEP have a wonderful day. Press Ctrl + C to exit.");
                                    }
                                })


                            }
                        }
                        if (resp.confirm === false) purchaseCanceled();
                            function purchaseCanceled() {
                            console.log(" ");
                            console.log("Your sale was canceled! Allow us to Return you to the products and services list.");
                            console.log(" ");
                            shop();
                        }

                    })
                }})
        })
    }
// connection.end();
}
