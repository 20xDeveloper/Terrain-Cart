const express = require('express')
const auth = require('../middleware/auth')
const Category = require('../models/category')


const router = new express.Router()



//adding a category
router.post("/category/add", async (req, res) => {
  try{
    const category = await new Category({
      name: req.body.name,
      shopId: req.body.shopId 
    });

    await category.save()

    res.send({message: "You have successfully added a category to the shop!"})
  }catch(error){
    console.log("here is the error message ", error.message)
  }
})

//adding a category
router.post("/category", async (req, res) => {

  try {
    console.log
    let categories = await Category.findAll({where: {
      shopId: req.body.shopId
    }})

    res.send({categories})
  }catch(error){
    res.send({error: "here is the error message from get catgories request " + error.message})
    console.log( "here is the error message from get catgories request " + error.message)

  }

})

//updating a category
router.post("/category/update", async (req, res) => {

  let categoryToUpdate = await Category.findOne({where: {id: req.body.categoryId}}) //find the category
  categoryToUpdate.name = req.body.name; //update the category name

  //I have no clue why I have the line below. I guess you can remove it.
  // categoryToUpdate.shopId = req.body.shopId; 

  await categoryToUpdate.save()

  res.send({ message: "you have successfully updated a category!"})
})

//delete a category
//THIS IS INCOMPLETE. I DID NOT TEST IT AND IT MIGHT STILL BE SET TO NOSQL QUERIES
router.delete("/category/:id", async (req, res) => {
  const categoryId = req.params.id;
  
  //check if the product exist
  let caategoryToDelete = await Category.findById(categoryId)
  if (!caategoryToDelete) {
    res.send({ error: "category not found."})
  }

  //delete the product
  await Category.deleteOne({ _id: categoryId });
  res.send({message: "you have deleted a category successfully!"})
  
  })




module.exports = router
