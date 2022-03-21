const Sequelize = require('sequelize')
const sequelize = require("../db/sequelize")


const billingAddressSchema = sequelize.define("BillingAddress",{
    address1: {
        type: Sequelize.STRING,
        allowNull: false
    },
    address2: {
        type: Sequelize.STRING
    },
    postalCode: {
        type: Sequelize.STRING,
        allowNull: false,
        trim: true,
        validate: {
          max: 6,
        }
    },
    countryCode: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          max: 2,
        }
    },
    international: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: Sequelize.DATE
    },
    updatedAt: {
      type: Sequelize.DATE
    }
})

module.exports = billingAddressSchema