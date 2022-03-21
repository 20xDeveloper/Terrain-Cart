const express = require('express')
const Shop = require('../models/shop')
const router = new express.Router()

// ALl of these request should be sent through post man. It's not made for a website to send.

// Add a new shop
router.post("/shop/add", async (req, res) => {
    const shop = new Shop({
        ...req.body
    })
    console.log(shop)
    try {
        await shop.save()
        res.status(201).send({shop})
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
