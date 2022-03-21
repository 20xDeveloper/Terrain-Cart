const express = require('express')
const User = require('../models/user')
const Product = require('../models/product')
const auth = require('../middleware/auth')
const Order = require('../models/order')
const router = new express.Router()


// never got to this point because never tested purchasing using stripe even though i have that set up
// I don't know what values holds the order table and don't know what it's used for
router.get("/orders", auth, async (req, res) => {
    try{
        const userOrders = await Order.findOne({where: { userId: req.user.id }})
        res.send({ userOrders }) //used property short hand es6 syntax
    }catch(e){{
        res.status(400).send({error: e})
    }}
    
 })
 





  module.exports = router

  




