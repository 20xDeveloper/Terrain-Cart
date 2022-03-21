const Sequelize = require('sequelize')

const sequelize = require("../db/sequelize")

const User = require("./user");



const ItemSchema = sequelize.define("Item", {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id'
        }
    },
    productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Product',
            key: 'id'
        }
    },
    quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
    }
    
}, {
    tableName: 'items',
    classMethods: {
        associate : function(models) {
            ItemSchema.belongsTo(models.Shop)
        },
    }
})

// ItemSchema.belongsTo(User)


module.exports = ItemSchema