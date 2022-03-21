const Sequelize = require('sequelize')

const sequelize = require("../db/sequelize")

const Shop = require("./shop");


const BannerSchema = sequelize.define("banners", {
    bannerHeader: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    bannerDescription: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
    },
    firebaseImageURL: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
    },
    categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    shopId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

// I never useed the belongsTo method from sequelize. Didn't know how to but I can look into it.
// It is used for foreign keys.


module.exports = BannerSchema