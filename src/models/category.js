const Sequelize = require('sequelize')

const sequelize = require("../db/sequelize")

const Shop = require("./shop");


const CategorySchema = sequelize.define("categories", {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    shopId: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: 'Shop',
          key: 'id'
        }
    },
    firebaseImageURL: {
        type: Sequelize.STRING,
        // required: true
    }
}, {
    tableName: 'categories',
    classMethods: {
        associate : function(models) {
            CategorySchema.belongsTo(models.Shop)
        },
    }
})

// I never useed the belongsTo method from sequelize. Didn't know how to but I can look into it.
// It is used for foreign keys.


module.exports = CategorySchema