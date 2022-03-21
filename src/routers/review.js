const express = require('express')
const auth = require('../middleware/auth')
const Product = require('../models/product')
const Shop = require('../models/shop')
const Image = require('../models/image')
const Category = require('../models/category')
const Review = require('../models/review')
const User = require('../models/user')



const router = new express.Router()
const multer = require('multer') //used for file upload. in this file we used it for image upload. uploading a profile picture.
const formidable = require('formidable');
const Sequelize = require("../db/sequelize");
const SequelizeLibrary = require("sequelize")

const Op = SequelizeLibrary.Op;


router.post("/reviews", async (req, res) => {
  try{
    let getReviewsForACertainProduct = await Review.findAll({where: {
        productId: req.body.productIdForTheProductWeAreViewing
    }})

    // Seriously you need to find out why .map() doesn't work. ask someone on discord

    // let listOfReviewsWithTheirReviewerName = getReviewsForACertainProduct.map(async (review, index) => {
    //     let getReviewerName = await User.findOne({where: {
    //         id: review.userId
    //     }})
    //     review.reviewerName = getReviewerName.name
    //     return review
    // })

    for(let i=0; i < getReviewsForACertainProduct.length;){
        let getReviewerName = await User.findOne({where: {
            id: getReviewsForACertainProduct[i].userId
        }})
        getReviewsForACertainProduct[i].reviewerName = getReviewerName.name
        i++;
    }

    console.log("reivew information ", getReviewsForACertainProduct)

    res.send({ allReviewsForThisProduct: getReviewsForACertainProduct })
  }catch(error){
    res.send({error: error.message})
    console.log("error ", error.message)
  }
  
})

router.post("/reviews/add-review", async (req, res) => {
  try{
    let saving_new_review = await Review.create(req.body);

    saving_new_review.save();

    res.send({message: "You have successfully added a review."})
  }catch(error){
    res.send({error: error.message})
    console.log("error ", error.message)
  }
  
})


module.exports = router
