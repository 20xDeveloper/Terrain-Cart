const Sequelize = require('sequelize')

const sequelize = require("../db/sequelize")

//THIS WILL NOT BE IN THE FIRST VERSION OF THE APPLICATION. EACH PRODUCT WILL ONLY HAVE ONE IMAGE.
//THIS MODEL AND TABLE WAS SUPPOSE TO HELP EACH PRODUCT HAVE MULTIPLE IMAGES.
//THIS FEATURE OF THE APPLICATION IS INCOMPLETE

const ImageSchema = sequelize.define("Image", {
    productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Product',
            key: 'id'
        }
    },
    firebaseImageURL: {
        type: Sequelize.STRING,
        // required: true
    },
    primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    }
}, {
        tableName: 'images',
        classMethods: {
            associate: function (models) {
                ImageSchema.belongsTo(models.Product)
            },
        }
    })


module.exports = ImageSchema