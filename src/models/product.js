const Sequelize = require('sequelize')

const sequelize = require("../db/sequelize")

const Shop = require("./shop");


const ProductSchema = sequelize.define("Product", {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    sku: {
        type: Sequelize.STRING,
    },
    firebaseImageURL: {
        type: Sequelize.STRING,
        // required: true
    },
    length: {
        type: Sequelize.INTEGER,
    },
    width: {
        type: Sequelize.INTEGER,
    },
    height: {
        type: Sequelize.INTEGER,
    },
    weight: {
        type: Sequelize.INTEGER,
    },
    shippingExempt: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Category',
            key: 'id'
        }
    },
    shopId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Shop',
            key: 'id'
        }
    },
    numberOfPurchases: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    similar_ID: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quantity: Sequelize.VIRTUAL,
    average_rating: Sequelize.VIRTUAL,
    primary_image: Sequelize.VIRTUAL,
    product_category: Sequelize.VIRTUAL

}, {
        tableName: 'products',
        classMethods: {
            associate: function (models) {
                ProductSchema.belongsTo(models.Shop)
            },
        }
    })

// productSchema.belongsTo(Shop, {foreignKey: 'shopId'})

module.exports = ProductSchema