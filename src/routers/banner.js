const express = require('express')
const Banner = require('../models/banner')
const Category = require('../models/category')

const router = new express.Router()

// ALl of these request should be sent through post man. It's not made for a website to send.

// Add a new shop
router.post("/banner", async (req, res) => {
    try{
        console.log("0", req.body)

        let getCategoryIdToFindBanner = await Category.findOne({where: {
            name: req.body.categoryName
        }})
        
        console.log("1", getCategoryIdToFindBanner);

        let getBannerByUsingCategoryId = await Banner.findOne({where: {
            categoryId: getCategoryIdToFindBanner.id
        }})
    
        console.log("2", getBannerByUsingCategoryId)

        res.send({ bannerInformation: getBannerByUsingCategoryId})
    } catch(error){
        console.log("here is the error message ", error.message)
    }
    
  
})

module.exports = router
