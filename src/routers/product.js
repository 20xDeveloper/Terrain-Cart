const express = require('express')
const auth = require('../middleware/auth')
const Product = require('../models/product')
const Shop = require('../models/shop')
const Image = require('../models/image')
const Category = require('../models/category')
const Similar_product = require('../models/similar_product')
const Review = require('../models/review')



const router = new express.Router()
const multer = require('multer') //used for file upload. in this file we used it for image upload. uploading a profile picture.
const formidable = require('formidable');
const Sequelize = require("../db/sequelize");
const SequelizeLibrary = require("sequelize");
const generalUtils = require("../utils/generalUtils");


const Op = SequelizeLibrary.Op;

//MULTER SET UP
// //set up the option object for the multer function. these options are for validation.
// //By the way there is a option property for the object that is passed as a paramter to the multer function which allows multer know where to store the image that is recieved. the reason we didn't do this because its better to store the file/image on the database. when you deploy your app on heroku it will remove all the files in yoru folder. the option property was called dest and you can set the value to the folder name or the path. forgot which one but you can look at the documentation of multar in npmjs.com. that is you job as a developer to read the documentation so get use to it.
// const upload = multer({
//   limits: {
//       fileSize: 3000000 //the limit file size can only be 1 mb
//   },
//   //I assume the req has all the req properties just like the route handler does and the other middleware like auth.
//   fileFilter(req, file, cb) {
//       if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) { //file has many methods and can see the multer documentation on npmjs.com
//           //that regular expression will target .jpg, .jpeg, .png at the end of the file. \. means anything with dot is targeting round brackets with those file extension followed by the pipe | means or and the dollar sign at the end means at the end of the string. / and ends with / is how a regular expression starts and ends. a good tool for regular expression is regex101.com something like that. go check it out.
//           return cb(new Error('Please upload an image')) //cb is used to end or move on to the next step of the program. in this case we are returning an error and to display it we will have to insert forth argument to the route handler. as seen below code.
//       }

//       cb(undefined, true) //this means everything went well and move on to the route handler. cause upload is a middleware. you can use more than one middleware in a route handler. first argument was suppose to be the error but it's undefined and second is if you should move on to the route handler. if you put false and undefined as the first argument you are giving a silent error. no error message but the site is not working.
//   }
// })

// Get all the shop products using the shopId
router.post("/products/category", async (req, res) => {
  try{
    let getCategoryIdForGivenCategoryName = await Category.findOne({where: {
      name: req.body.categoryName
    }})

    let getAllProductsFromOneCategory = await Product.findAll({where: {
      categoryId: getCategoryIdForGivenCategoryName.id
    }})
  
    // Get the images for each product
    let category_products_with_image = []
    for(const product of getAllProductsFromOneCategory){
      let primary_image_for_this_product = await Image.findOne({where: {
        productId: product.id,
        primary: 1
      }});

      product.primary_image = primary_image_for_this_product.firebaseImageURL;
      category_products_with_image.push(product);
    }

    res.send({category_products_with_image })
  }catch(error){
    res.send({error: error.message})
    console.log("error ", error.message)
  }
  
})


// Get all the shop products using the shopId
router.post("/products", async (req, res) => {
  try{
    let getShopProducts = await Product.findAll({where: {
      shopId: req.body.shopId
    }})
  
    res.send({thisShopProducts: getShopProducts})
  }catch(error){
    res.send({error: error.message})
    console.log("error ", error.message)
  }
  
})

// Get the products that has the most number of purchases
router.get("/products/best-seller", async (req, res) => {
  try {
    let bestSellers = await Sequelize.query("SELECT * FROM products ORDER BY numberOfPurchases DESC LIMIT 4")

    let listOfBestSellersWithItsCategoryName = []

    for(let i=0; i < bestSellers[0].length;){

      let categoryForThisProduct = await Category.findOne({where: {
        id: bestSellers[0][i].categoryId
      }})

      let productWithCategoryName = {
        id: bestSellers[0][i].id,
        productName: bestSellers[0][i].name,
        productPrice: bestSellers[0][i].price,
        productCategory: categoryForThisProduct.name,
        firebaseImageURL: bestSellers[0][i].firebaseImageURL

      }

      listOfBestSellersWithItsCategoryName.push(productWithCategoryName)

      i++
    }

    // -- The above code is pretty messy and bad. I made that way back when I had a job so wasn't really that experienced. Don't feel like refactoring it. Too much work and I have other things to do. --

    // Get the primary image for each best seller and attach it as a sequelize virtual property
    let bestSellers_with_category_name_and_primary_image = []
    for(const product of listOfBestSellersWithItsCategoryName){
      let primary_image_for_this_product = await Image.findOne({where: {
        productId: product.id,
        primary: 1
      }});

      product.primary_image = primary_image_for_this_product.firebaseImageURL;
      bestSellers_with_category_name_and_primary_image.push(product);
    }

    // Get the on sale products even if the front end didn't ask for it.
    let on_sale_products = await Sequelize.query("SELECT * FROM products WHERE sale_discount > 0  LIMIT 4")
    console.log("here are the products that are on sale ", on_sale_products)

    // Get the image for each on sale product
    let on_sale_products_with_primary_image_and_average_rating = []
    for(let on_sale_product of on_sale_products[0]){
        on_sale_product = await generalUtils.get_product_primary_image_and_average_rating(on_sale_product)

        // find the category for this product and save it as the sequelize virtual property we created
        let category_for_this_product = await Category.findOne({
          where: {
            id: on_sale_product.categoryId
          }
        })

        on_sale_product.product_category = category_for_this_product.name
        on_sale_products_with_primary_image_and_average_rating.push(on_sale_product)
      }


    res.send({bestSellers_with_category_name_and_primary_image, on_sale_products_with_primary_image_and_average_rating})
  }catch(error){
    console.log("here is the error message ", error.message)
  }

})


// Pass the name of the shopping cart site to get all the products for it
router.get("/products/:name", async (req, res) => {
  let shopName = req.params.name //Get the name of the shopping cart site

  let whichSite = await Shop.findOne({ where: { name: shopName } }) // look for it through the database

  // get all the products from the database for that shopping site 
  let siteProducts = await Product.findAll({
    where: {
      shopId: whichSite.id
    }
  })

  res.send({ siteProducts: siteProducts }) // We could have used property shorthand syntax here

})


// Used to add a product to the shop. On the front end it must be a form
// because we only allow form data to be accept in this route handler function
router.post("/products/add",  async (req, res) => {
  
    const form = new formidable.IncomingForm(); // Used when passing form data from the front end. If you don't use this you wont get your value or some other errors will happen. Don't remember exactly
    form.parse(req, async (err, fields, files) => {
      try { 
        const product = await new Product({
          name: fields.name,
          price: fields.price,
          description: fields.description,
          stock: fields.stock,
          sku: fields.sku,
          categoryId: fields.categoryId,
          shopId: fields.shopId,
          firebaseImageURL: fields.firebaseImageURL, // In the front end we saved the image on firebase cloud storage (BaaS). So we are saving the url for it so when display the list of products it will get it's image
          length: fields.length,
          width: fields.width,
          height: fields.height,
          weight: fields.weight
        });
    
        await product.save()
    
        res.send({ message: "we successfully added a product to the shop!" })
    } catch (e) {
      res.status(400).send({ error: e })
  
    }
      
  });

})

//updating a product
router.post("/products/update", async (req, res) => {

  let productToUpdate = await Product.findOne({ where: { id: req.body.productId } })

  // It seems like we can't update the firebase image url or store a new one
  // Will have to look into this. Also, in the front end make sure you have the old values for the product
  // information set. So, if they erase it, that will be updated if they don't then it will stay the same
  // as you can see the code below this line
  productToUpdate.name = req.body.name;
  productToUpdate.price = req.body.price;
  productToUpdate.stock = req.body.stock;
  productToUpdate.sku = req.body.sku;

  productToUpdate.description = req.body.description;

  await productToUpdate.save()

  res.send({ message: "you have successfully updated a product!" })
})

//delete a product
router.delete("/products/:id", async (req, res) => {
  const prodId = req.params.id;

  //check if the product exist
  let productToDelete = await Product.findOne({ where: { id: prodId } })
  if (!productToDelete) {
    res.send({ error: "product not found." }) // I guess res.send can be used as return because after this if statement the code probably doesn't run. Need to look into this
  }

  //delete the product
  await Product.destroy({ where: { id: prodId } }); 
  res.send({ message: "you have deleted a product successfully!" })

})

// This route handler function is used for both getting one product information and a list of product information when searching for products
router.post("/products/search", async (req, res) => {
  try {

    // -- if it's true it means they are searching for a product. --
    if(req.body.useLikeQuery === true){
      let searchProductsResults = await Product.findAll({where: {
        name: { [Op.like]: "%" + req.body.searchInput + "%" }
      }})
    
      res.send({searchProductsResults})
    }else{
      // -- means we want a product information for one product. --
      let searchProductsResults = await Product.findAll({where: { // it should be findOne instead of findAll. I left it just in case if i'm missing why i did it this way. but also because then i have to change the front end code and i am feeling lazy to do that.
        name: req.body.searchInput
      }})
      // -- Get the list of images for a product --
      let this_product_images = await Image.findAll({
        where: {
          productId: searchProductsResults[0].id
        }
      })

      // -- Get the primary image to make it easier to display in the front end --
      // let primary_image = this_product_images.filter((product_image) => product_image.primary === 1 )


      // Get the list of similar products for this product
      let list_of_similar_products = await Similar_product.findAll({where: {
        similar_ID: searchProductsResults[0].similar_ID,
        
      },
    limit: 4
  })


      // -- Get the product details for each product using the list of similar_products records we got from that table above --

      let list_of_similar_products_details = [] // the name is different because it has details at the end of the variable name
      for(const similar_product of list_of_similar_products){

        // Get the product details using the product_ID
        let product_details = await Product.findOne({
          where: {
            id: similar_product.product_ID
          }
        })

        // Calculate the average review for this product and attach it as a Sequelize virtual property
        let get_all_reviews_for_this_product = await Review.findAll({
          where: {
            productId: product_details.id
          }
        })

        let average_rating_for_this_product = await generalUtils.calculate_average_rating(get_all_reviews_for_this_product);

        product_details.average_rating = average_rating_for_this_product

        // Get the primary image for this similar product and attached it to the sequelize virtual property called primary_iamge
        let primary_image_for_this_product = await Image.findOne({
          where: {
            productId: product_details.id
          }
        })

        product_details.primary_image = primary_image_for_this_product.firebaseImageURL

        list_of_similar_products_details.push(product_details)

      }

      res.send({searchProductsResults, this_product_images, list_of_similar_products_details})
    }
    
    
  } catch(error){
    console.log("here is the error message ", error.message)
  }
})




module.exports = router
