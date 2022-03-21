const Sequelize = require('sequelize')

const sequelize = require("../db/sequelize")

const Product = require("./product")
const Category = require("./category")


const shopSchema = sequelize.define("Shop", {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    postalCode: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true
    },
    website: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'shops',
    classMethods: {
        associate : function(models) {
            shopSchema.hasMany(models.Product, { as: 'shopProducts'})
            shopSchema.hasMany(models.Category)

        },
    }
});

//it automatically knows to check for shopId in the other table becuase in this table there
//is no productId field. This is how programming work. Libraries like sequelize are very smart
//and you don't have to define the name or the linking. it does it behind the scenes which is very
//powerful and prevents a lot of errors in the future. it also improves RAD which is what a lot
//of companies want and is why .NET developers gets paid a lot.
// shopSchema.hasMany(Product)
// shopSchema.hasMany(Category)


// shopSchema.virtual('products', {
//     ref: 'Product', //I think it has to match of the model name you imported to this file or just has to exist in the database.
//     localField: '_id',
//     foreignField: 'shopId'
// })

// shopSchema.virtual('categories', {
//     ref: 'Category', //I think it has to match of the model name you imported to this file or just has to exist in the database.
//     localField: '_id',
//     foreignField: 'shopId'
// })


module.exports = shopSchema