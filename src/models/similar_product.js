const Sequelize = require('sequelize')

const sequelize = require("../db/sequelize")

const Product = require("./product")
const Category = require("./category")


const similar_product_schema = sequelize.define("Similar_product", {
    similar_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    product_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
  
});



module.exports = similar_product_schema