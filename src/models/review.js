const Sequelize = require('sequelize')

const sequelize = require("../db/sequelize")

const Shop = require("./shop");
function currentDate() {
	var dateTime = require("node-datetime");
	var dt = dateTime.create();
	var formatted = dt.format("Y-m-d H:M:S");
	return formatted;
}

const ReviewSchema = sequelize.define("reviews", {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    productId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        defaultValue: null
    },
    createdAt: {
			type: Sequelize.DATE,
			defaultValue: currentDate() //I think this means that if you don't provide a value when setting or updating it will just use the current date as the default value
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: currentDate() //I think this means that if you don't provide a value when setting or updating it will just use the current date as the default value
    },
    reviewerName: Sequelize.VIRTUAL
})


module.exports = ReviewSchema