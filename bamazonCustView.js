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
var invenArr = [];
var priceArr = [];
var productDescArr = [];
var localDBArr = [];

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
            //Make an array for the ids of the items
            var id = res[i].item_id;
            idArray.push(id);

            //Make an array for the current inventory on-hand (IOH)
            var inventory = res[i].stock_available;
            invenArr.push(inventory);

            //Make an array for the item's price
            var price = res[i].price;
            priceArr.push(price);
        
            //Make an array for the item names
            var productDesc = res[i].product_name
            productDescArr.push("'" + productDesc + "'");

            //Displays the current inventory as a list for the user to browse
            console.log("|| ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Department: " + 
            res[i].department + " || Price: $" + res[i].price + " ||");
            console.log("-------------------------------------------------------------------------------------------"+
            "----------------------------------------")
            counter++;
          } 
        
        // These are console.log-checks to make sure the arrays are being consructed properly
        // console.log("ID Array: " + idArray);
        // console.log("ID Array: " + invenArr);
        // console.log("ID Array: " + priceArr);
         console.log("item description array: " + productDescArr)
        
        // //push the completed Arrays to a larger array for ease of passing parameters
        // localDBArr.push(idArray, invenArr, priceArr, productDescArr)
        // console.log("Local Database Array: " + localDBArr);

        // After Displaying the inventory, prompt the user for input
        userPrompts(idArray, invenArr, priceArr);
    });
}
function userPrompts(idArray, invenArr, priceArr){
    inquirer.prompt([
        {
            name: "productID",
            type: "input",
            message: "Which item would you like to purchase? Pick by entering the item's ID number: ",
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
            message: "How many would you like to order? Please enter a number, i.e. 3: ",
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                  return false;
                }
        }
    ]).then( function (answer){
        var id = parseFloat(answer.productID);
        var nodeIndex = idArray.indexOf(id);
        if (idArray.indexOf(id !== -1 )) {
            // These are console.log-checks to make sure things are being constructed and read properly
            console.log("Item ID: " + id + ", ID Index in Array: " + nodeIndex)
            console.log("The idArray is reading correctly")
            checkInventory(id, idArray, invenArr, priceArr, productDescArr, nodeIndex, answer)
        } else {
            console.log("The idArray is not reading right");
            connection.end();
            return
        }
    });
} 

function checkInventory(id, idArray, invenArr, priceArr, productDescArr, nodeIndex, answer){
    var invenRequest = parseFloat(answer.orderQuantity);
    var inventoryID = invenArr[nodeIndex]
    console.log("Inventory ID: " + inventoryID)
    if ((inventoryID - invenRequest) >= 0 ){
        console.log("item is in stock, may proceed to checkout");
        makeSale(id, invenRequest, priceArr, productDescArr, nodeIndex, inventoryID);
    } else{
        console.log("--------------------------------------------------------------------------------------------")
        inquirer.prompt({
            type: "confirm",
            name: "YesorNo",
            message: "I'm sorry, we don't have the amount you requested in stock." +
            "\nThe maximum amount we have is: " + inventoryID + ". Is this okay?"
        }).then (function(answer2){
            if (answer2.YesorNo){
                invenRequest = inventoryID;
                console.log("New amount to order is " + invenRequest)
                makeSale(id, invenRequest, priceArr, productDescArr, nodeIndex, inventoryID);
            } else{
                console.log("Sorry about that! Please check again soon - we'll have it in stock then!")
                connection.end();
                return
            }
        })
    }
}

function makeSale(id, invenRequest, priceArr, productDescArr, nodeIndex, inventoryID){
    var purchase = productDescArr[nodeIndex]
    var price = priceArr[nodeIndex]
    console.log("--------------------------------------------------------------")
    inquirer.prompt({
        name: "checkoutConfirm",
        message: "Alright, so that will be " + invenRequest + " of the " + purchase + ".",
        type: "confirm"
    }).then(function(answer3){
        if (answer3.checkoutConfirm){
            checkOut(id, invenRequest, priceArr, productDescArr, nodeIndex, inventoryID)
        } else{
            inquirer.prompt({
                name: "newinvenRequest",
                type: "input",
                message: "I'm sorry for the misunderstanding - how many would you like to order? " + 
                         "New amount must be less than or equal to the current amount",
            }).then(function(answer4){
                var newAmount = parseFloat(answer4.newinvenRequest);
                if (newAmount > invenRequest){
                    console.log("I'm sorry, the new amount must be less than the previous entry.")
                    makeSale(id, invenRequest, priceArr, productDescArr, nodeIndex, inventoryID);

                } else if (newAmount === NaN){
                    console.log("I'm sorry, I couldn't understand that. Please make sure "+ 
                                "you are entering a number less than the previous amount")
                    makeSale(id, invenRequest, priceArr, productDescArr, nodeIndex, inventoryID);
                } else if (newAmount <= invenRequest){
                    invenRequest = newAmount;
                    makeSale(id, invenRequest, priceArr, productDescArr, nodeIndex, inventoryID);

                } else {
                    console.log("I'm sorry - there was an error and the program needs to close");
                    connection.end();
                    return
                }
            });
        }
    })
    
    
}

function checkOut(id, invenRequest, priceArr, productDescArr, nodeIndex, inventoryID){
    var unitPrice = priceArr[nodeIndex];
    var subTotal = unitPrice * invenRequest;
    var priceTotal = subTotal *1.08
    console.log("----------------------------------------------------------------------")
    console.log("Okay the unit price is: $" + unitPrice + ".")
    console.log("The subtotal for " + invenRequest + " of these is $" + subTotal + ".")
    console.log("With an 8% sales' tax, your total cost is: $" + priceTotal);
    console.log("Thank you for shopping with us!")
    updateBamazonDB(id, invenRequest, inventoryID)
};

function updateBamazonDB(id, invenRequest, inventoryID){
    // console.log("requested Amount: " + invenRequest)
    // console.log("Available Amount: " + inventoryID)
    var newInventoryonHand = parseFloat(inventoryID - invenRequest);
    connection.query( 
        "UPDATE products SET ? WHERE ?;", [{stock_available: newInventoryonHand}, 
        {item_id: id}] ,function(err, res){
        if (err) throw err
            console.log("Database update was sucessful!")
            connection.end()
            return
    })
}