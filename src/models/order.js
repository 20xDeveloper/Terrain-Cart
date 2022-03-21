const Sequelize = require('sequelize')

const sequelize = require("../db/sequelize")

const Product = require("./product");
const User = require("./user");



const orderSchema = sequelize.define('order', {
  productId: 
    {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
  }
}, {
  tableName: 'orders',
  classMethods: {
      associate : function(models) {
        orderSchema.hasMany(models.Product)
        orderSchema.hasMany(models.User)
        
      },
  }
});

// orderSchema.hasMany(Product)
// orderSchema.hasMany(User)


module.exports = orderSchema;
