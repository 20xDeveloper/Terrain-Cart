const express = require('express')
const User = require('../models/user')
const Product = require('../models/product')
const Item = require('../models/item')
const Shop = require('../models/shop')

const BillingAddress = require('../models/billingAddress')
const userUtils = require('../utils/userUtils');
const generalUtils = require('../utils/generalUtils');
var cors = require('cors')


//Stripe
const stripe = require('stripe')('sk_test_j4cqjsEDHggTyaDT3YH8heam00vVL03Y80')
const uuid = require('uuid/v4')



const auth = require('../middleware/auth')
const router = new express.Router()

//display user cart items
router.get("/cart", auth, async (req, res) => {
    try{
        // Items refers to user cart items with out the product info. Items table has a
        // field called userId and productId. Both are foreign key to let it know which user
        // it belongs to and which product this item is.
        let userCartItemsWithOutProductInfo = await Item.findAll({where: {userId: req.user.id}})
        // console.log("here is the user cart items variable", userCartItemsWithOutProductInfo)

        // This will hold the user cart items with the product info
        let userCartItems =  [];

        // Popular the userCartItems array
        for(i = 0; userCartItemsWithOutProductInfo.length > i; i++){
            let product = await Product.findOne({where: {id: userCartItemsWithOutProductInfo[i].productId}})
            // console.log("here is the value for the product variable", product)
            product.quantity = userCartItemsWithOutProductInfo[i].quantity

            userCartItems.push(product)
        }

        // Add up the total of the cost in a user cart 
        let total = 0
        await userCartItems.forEach(p => {
            total += p.quantity * p.price; //need to look into this why we can access price in the productId property
        });

        // Send the total cost and the list of cart items the user have. 
        res.send({ userCartItems, total })
    }catch(e){  
        res.status(400).send({ error: e.message })

    }
    
 })

 // Get the shipping rates cost for all the cart items the user has in his shopping cart
 router.get("/cart/rates", cors(), auth, async (req, res) => {
    // Get user cart items
    let userCartItemsWithOutProductInfo = await Item.findAll({where: {userId: req.user.id}})

    let userCartItems =  [];

    for(i = 0; userCartItemsWithOutProductInfo.length > i; i++){
        let product = await Product.findOne({where: {id: userCartItemsWithOutProductInfo[i].productId}})
        product.quantity = userCartItemsWithOutProductInfo[i].quantity

        userCartItems.push(product)
    }

    // Get user billing address for later use
    let userBillingAddress = await BillingAddress.findOne({where: {id: req.user.billingId}})

    // Instantiate a new canada post client object
    const CanadaPostClient = require("canadapost-api")
    const CanadaPostClientObject = new CanadaPostClient("5a678d0f8e1e4005", "8db20bef4eaebf7c943fcb", "0008857701", "en-CA") 

    // Get the shop postal code to use later for canadapost getRates method
    const shop = await Shop.findOne({where: {id: userCartItems[0].shopId}})
    const shopPostalCode = shop.postalCode

    // initializing the 4 total cost of the shipping rate options
    let ExpeditedParcelTotalCost = 0
    let PriorityTotalCost = 0
    let RegularParcelTotalCost = 0
    let XpresspostTotalCost = 0

    // The array of objects that will contain each shipping rate option with it's details.
    // This is what we will return back to the client
    let totalCostOptions = []
    totalCostOptions[0] = {}
    totalCostOptions[1] = {}
    totalCostOptions[2] = {}
    totalCostOptions[3] = {}
  
        

    try{
    // Calculate the cost for each cart item separately
    for(i=0; i<userCartItems.length;){
      if(userCartItems[i].shippingExempt === 0){
        // Calculate the weight
        let weight = userCartItems[i].weight;
        weight = generalUtils.precise_round(weight * 0.453592, 2);
        
        // Initializing the objects that are required to getting the shipping rates with the .getRates() method
        let scenario = {}
        scenario.parcelCharacteristics = {}
        scenario.parcelCharacteristics.dimensions = {}
        scenario.destination = {}

        // Get the dimensions and the weight for canada post to calculate how much the shipping rate will cost
        scenario.parcelCharacteristics.weight = weight
        scenario.parcelCharacteristics.dimensions.length = userCartItems[i].length
        scenario.parcelCharacteristics.dimensions.width = userCartItems[i].width
        scenario.parcelCharacteristics.dimensions.height = userCartItems[i].height

        // Where the package is being shipped from
        scenario.originPostalCode = shopPostalCode

        // Where the package is going
        if(userBillingAddress.countryCode === "CA"){
          scenario.destination.domestic = {}
          scenario.destination.domestic["postal-code"] = userBillingAddress.postalCode
        }else if(userBillingAddress.countryCode === "US"){
          scenario.destination.unitedStates = {}
          scenario.destination.unitedStates["zipCode"] = userBillingAddress.postalCode
        }else{
          scenario.destination.international = {}
          scenario.destination.international["countryCode"] = userBillingAddress.countryCode
        }

          // Finally get the shipping Rates
          let shippingRates = await CanadaPostClientObject.getRates(scenario)

            // Check if shippingRates value is not empty. Even though we have a try catch block above this line
            // we don't want the code to run and crash even more. we don't want a fake error
            if(shippingRates){

              //loop through each shipping rate option and add it to the 4 total global variable which represents the total cost for each cart item
              //remember this foreach statement is in a foreach statement that is looping through each cart item
                for(r=0; r<shippingRates.length;){

                  // Check which shipping rate option we are looping through right now and add the rate cost
                  // to the total global variable that represents that specific shipping rate option
                  // After that save it in the variable that holds all the total cost for each shipping rate option
                  if(shippingRates[r].serviceName === "Expedited Parcel"){
                    ExpeditedParcelTotalCost += shippingRates[r].priceDetails.due * userCartItems[i].quantity
                    totalCostOptions[0].name = shippingRates[r].serviceName
                    totalCostOptions[0].price = ExpeditedParcelTotalCost.toFixed(2)
                  }else if(shippingRates[r].serviceName === "Priority"){
                    PriorityTotalCost += shippingRates[r].priceDetails.due * userCartItems[i].quantity
                    totalCostOptions[1].name = shippingRates[r].serviceName
                    totalCostOptions[1].price = PriorityTotalCost.toFixed(2)
                  }else if(shippingRates[r].serviceName === "Regular Parcel"){
                    RegularParcelTotalCost += shippingRates[r].priceDetails.due * userCartItems[i].quantity
                    totalCostOptions[2].name = shippingRates[r].serviceName
                    totalCostOptions[2].price = RegularParcelTotalCost.toFixed(2)
                  }else if(shippingRates[r].serviceName === "Xpresspost"){
                    XpresspostTotalCost += shippingRates[r].priceDetails.due * userCartItems[i].quantity
                    totalCostOptions[3].name = shippingRates[r].serviceName
                    totalCostOptions[3].price = XpresspostTotalCost.toFixed(2)
                  }

                  r++

                } //end of new foreach statment
            } //end of if statement for checking if we got shipping rate options back
          }else{
            totalCostOptions[0].name = "STANDARD SHIPPING COURTESY"
            totalCostOptions[0].price = 0
          } // if statement to check if it has shipping exempt
           i++
        }  //end of new cart items for loop NEW
    
        // Finally send the total cost for each shipping rate option
        console.log("here is the value for the TOTAL cost of each shipping rate option ", totalCostOptions)
        res.send({shippingRatesCost: totalCostOptions})
        }catch(e){
            console.log(e)
        }

 }) // end of route handler function
 
 // Add a product to the user shopping cart
 router.post("/cart/add", auth, async (req, res) => {
     try{
        const prodId = req.body.productId;
        let productToAdd = await Product.findOne({where:{id: prodId}})
        console.log("debugging")   

        await userUtils.addToCart(productToAdd, req.user, req.body.typeOfModify, req.body.userInputForUpdatingQuantity); //This adds the product to the user shopping cart

        res.send({message: "added to cart!"})
     }catch(e){
        res.status(400).send({error: e.message});
        console.log("here is the error message in cart add route handler ", e.message)
     }
  })
 
  //removes a cart item
  //client has to provide a productId to us. So, it should be a hidden field in their front end form
  router.post("/cart/remove", auth, async (req, res) => {
     const prodId = req.body.productId;
     await userUtils.removeFromCart(prodId, req.user) //This handles everything for removing a cart item from a user shopping cart
     res.send({message: "you have successfully removed a cart item"})
 
  })

//THIS IS WHERE I LEFT OFF RIGHT HERE JUNE 9, 2019
//create your router for the stripe check out here because we don't want to use the csrfProtection
//so write the route handler here before line 18. we don't want to run that code first before
//our stripe checkout. it has its own csrf token. we will get an error. The code works from top to bottom.
//this router will not work on postman because we don't know how to send
//a stripe token. So, use this when you are actually ready to test.
router.post("/cart/checkout", auth, async (req, res) => {
    //this token is retrieved from front end form.
    //It's not an ordinary form. We got the code from the stripe documentation
    //when you submit that form which is the pop up dialog where you have to
    //enter your credit card information. Then it comes to our backend
    //and we process it. this token contains the user credit card information  
    // const token = req.body.token
    // console.log("here is the value for the ", req.body.token)
    //get the total price for all cart items
    let userCartItemsWithOutProductInfo = await Item.findAll({where: {userId: req.user.id}})
  
          let userCartItems =  [];
  
  
          for(i = 0; userCartItemsWithOutProductInfo.length > i; i++){
              let product = await Product.findOne({where: {id: userCartItemsWithOutProductInfo[i].productId}})
             
              product.quantity = userCartItemsWithOutProductInfo[i].quantity
  
              userCartItems.push(product)
  
  
          }
  
          // console.log("here is the req.body ", req.body)
    let total = 0
    await userCartItems.forEach(p => {
      total += p.quantity * p.price; //need to look into this why we can access price in the productId property
    });
  
    //save the order in the database
    // WE MIGHT NEED THIS IN THE FUTURE
    // const products2 = await user.cart.items.map(i => {
    //   return { quantity: i.quantity, product: { ...i.productId._doc } };
    // });
    // const order = new Order({
    //   user: {
    //     email: req.user.email,
    //     userId: req.user
    //   },
    //   products: products2
    // });
    // await order.save();
  try{
    let status = null
  
    // if(req.body.customer_credit_card_exp_month.charAt(0) === '0'){

    // }

    console.log("here is the value for year ", "20" + req.body.customer_credit_card_exp_year.trim())

    // -- Create the stripe token that will hold the credit card information --
    // We use the token.id after wards for the source property when creating the customer object
    // which will be used to take money from his account when we call the charges.create() method
    // in that method we will use the customer.id
    let token = await stripe.tokens.create(
      {
        card: {
          number: req.body.customer_credit_card_number,
          exp_month: req.body.customer_credit_card_exp_month.trim(),
          exp_year: "20" + req.body.customer_credit_card_exp_year.trim(),
          cvc: req.body.customer_credit_card_cvc_number,
        },
      },
     async function(err, token) {
        // console.log("here is the error message in stripe.create ", err)
        // console.log("here is the token value in stripe.create ", token)

console.log("here is the req.body ", req.body)
console.log("here is the token value ", token)
// asynchronously called
        const customer =  await stripe.customers.create({
          email: req.body.email_address,
          source: token.id // Contains customer credit card number
        })

        const charge = await stripe.charges.create({ //make sure you install the stripe module using npm install stripe and required the module in this file
          // amount: total * 100, //amount option is how much you are charging. the value in the amount property is in cents so you will have to multiply the value by 100
          amount: 100, //amount option is how much you are charging. the value in the amount property is in cents so you will have to multiply the value by 100
          currency: 'usd', //what currency you want th charge to be in
          description: 'Demo Order', //I don't know what this is you will have to read the documentation for it.
          // transfer_data: { // THIS IS WHERE I LEFT OFF!!!!!!!!!!!!!!
          //   destination: "{{CONNECTED_STRIPE_ACCOUNT_ID}}",
          // },      
          customer: customer.id,
          receipt_email: token.email,
          shipping: {
            // name: token.card.name,
            name: req.body.firstName + " " + req.body.lastName,
            // address: {
            //   line1: token.card.address_line1,
            //   line2: token.card.address_line2,
            //   city: token.card.address_city,
            //   country: token.card.address_country,
            //   postal_code: token.card.address_zip
            // }
            address: {
              line1: req.body.address,
              line2: req.body.address2,
              city: req.body.city,
              country: req.body.country,
              postal_code: req.body.postalCode
            }
          }
          // metadata: { order_id: result._id.toString() } //this is optional. i don't know what the meta data is i think it will display the order Id in the stripe admin dashboard. make sure you .toString() your order._id. also you should have a order collection in your api. profressional sites have the history of orders for each user saved in the database.
        })
        
      }
    );

    // (async () => {
    //   const intent = await stripe.paymentIntents.create({
    //     amount: 1099,
    //     currency: 'usd',
    //     setup_future_usage: 'off_session',
    //   });
    // })();

    // console.log("here is the value for token ", token.id)

    // const customer =  await stripe.customers.create({
    //   email: req.body.email_address,
    //   source: token.id // Contains customer credit card number
    // })
  
    // REMEMBER TO ADD TAX TO THE TOTAL VARIABLE
  
    const idempotency_Key = uuid()
  
  
    //Take the user money from the stripe token (stripe token = credit card information)
    // const charge = await stripe.charges.create({ //make sure you install the stripe module using npm install stripe and required the module in this file
    //   // amount: total * 100, //amount option is how much you are charging. the value in the amount property is in cents so you will have to multiply the value by 100
    //   amount: 100, //amount option is how much you are charging. the value in the amount property is in cents so you will have to multiply the value by 100
    //   currency: 'usd', //what currency you want th charge to be in
    //   description: 'Demo Order', //I don't know what this is you will have to read the documentation for it.
    //   // transfer_data: { // THIS IS WHERE I LEFT OFF!!!!!!!!!!!!!!
    //   //   destination: "{{CONNECTED_STRIPE_ACCOUNT_ID}}",
    //   // },      
    //   customer: customer.id,
    //   receipt_email: token.email,
    //   shipping: {
    //     // name: token.card.name,
    //     name: req.body.firstName + " " + req.body.lastName,
    //     // address: {
    //     //   line1: token.card.address_line1,
    //     //   line2: token.card.address_line2,
    //     //   city: token.card.address_city,
    //     //   country: token.card.address_country,
    //     //   postal_code: token.card.address_zip
    //     // }
    //     address: {
    //       line1: req.body.address,
    //       line2: req.body.address2,
    //       city: req.body.city,
    //       country: req.body.country,
    //       postal_code: req.body.postalCode
    //     }
    //   }
    //   // metadata: { order_id: result._id.toString() } //this is optional. i don't know what the meta data is i think it will display the order Id in the stripe admin dashboard. make sure you .toString() your order._id. also you should have a order collection in your api. profressional sites have the history of orders for each user saved in the database.
    // }
    // , {
    //   idempotency_Key
    // }, function(err, charge){
    //   console.log("here is the idempotency error ", err)
    //   console.log("here is the charge  ", charge)

    // }
    // );

    await userUtils.clearCart(req.user.id); //Removes all items in the user cart because he just purchased all of them

    // console.log("Charge:", {charge})
    // status = "success"
  
    res.send({ message: "Your order is on its way! We sent you a confirmation email." })
  } catch(error){
    console.log("Error", error)
    res.send({ error: error })
  }
    
  
  })



  module.exports = router

  