var mysql = require("mysql")
var inquirer = require("inquirer")

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // your username
    user: "root",

    //Your password
    password: "1998",
    database: "bamazonDB"
});

var idArray = [];

connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    displayProducts()

});

function displayProducts(){
    connection.query("SELECT * FROM products", function(err, res){
        let counter = 0;
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            var id = res[i].item_id
            idArray.push(id);
            console.log("|| ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + 
            res[i].department + " || Price: $" + res[i].price + " ||");
            console.log("-------------------------------------------------------------------------------------------"+
            "----------------------------------------")
            counter++;
          } 
        console.log("ID Array: " + idArray)
        userPrompts(idArray);
    });
}
function userPrompts(array){
    inquirer.prompt([
        {
            name: "productID",
            type: "input",
            message: "Which item would you like to purchase (Select via item ID)",
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                  return false;
                }
 
        },
        {
            name: "orderQuantity",
            type: "input",
            message: "How many would you like to order (enter a number, i.e. 3)",
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                  return false;
                }
        }
    ]).then( function (answer){
        var id = parseFloat(answer.productID)
        if (array.indexOf(id !== -1 )) {
            console.log("The array is reading correctly")
            connection.end();
            return
        } else {
            console.log("The array is not reading right");
            connection.end();
            return
        }
    });
} 

function checkInventory(){
    
}