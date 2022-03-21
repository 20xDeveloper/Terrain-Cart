const Image = require('../models/image')
const Review = require('../models/review')

// I don't know how to call a method inside a method of the same object so i declared this function globally. doesn't make a difference. could have figured out if i tried but it's w/e.
calculate_average_rating = (product_reviews) => {
    // -- declare total rating --
    let total_zero_and_half_star_rating = 0;
    let total_one_star_rating = 0;
    let total_one_and_half_star_rating = 0;
    let total_2_star_rating = 0;
    let total_2_and_half_star_rating = 0;
    let total_3_star_rating = 0;
    let total_3_and_half_star_rating = 0;
    let total_4_star_rating = 0;
    let total_4_and_half_star_rating = 0;
    let total_5_star_rating = 0;


    // -- loop through each rating and increase the total rating accordingly --
    for(const review of product_reviews){
        switch(review.rating){
            case "0.5":
            total_zero_and_half_star_rating++;
            break;
            case "1":
            total_one_star_rating++;
            break;
            case "1.5":
            total_one_and_half_star_rating++;
            break;
            case "2":
            total_2_star_rating++;
            break;
            case "2.5":
            total_2_and_half_star_rating++;
            break;
            case "3":
            total_3_star_rating++;
            break;
            case "3.5":
            total_3_and_half_star_rating++;
            break;
            case "4":
            total_4_star_rating++;
            break;
            case "4.5":
            total_4_and_half_star_rating++;
            break;
            case "5":
            total_5_star_rating++;
            break;
        }
    }

    

    // -- Get the average star rating --
    let average_rating_for_this_product = (5*total_5_star_rating + 4.5*total_4_and_half_star_rating + 4*total_4_star_rating + 3.5*total_3_and_half_star_rating + 3*total_3_star_rating + 2.5*total_2_and_half_star_rating + 2*total_2_star_rating + 1.5*total_one_and_half_star_rating + 1*total_one_star_rating + 0.5*total_zero_and_half_star_rating)  / (total_5_star_rating+total_4_and_half_star_rating+total_4_star_rating+total_3_and_half_star_rating+total_3_star_rating+total_2_and_half_star_rating+total_2_star_rating+total_one_and_half_star_rating+total_one_star_rating+total_zero_and_half_star_rating)
    console.log("HEY", parseFloat(average_rating_for_this_product))
    
    return average_rating_for_this_product;
  
}




//object literal is my preffered way of creating a javascript class
let generalUtils = {
    precise_round: (num, dec) => {
          if ((typeof num !== 'number') || (typeof dec !== 'number')) 
          return false; 
        
          var num_sign = num >= 0 ? 1 : -1;
            
          return (Math.round((num*Math.pow(10,dec))+(num_sign*0.0001))/Math.pow(10,dec)).toFixed(dec);
    },
    calculate_average_rating: (product_reviews) => {
        // -- declare total rating --
        let total_zero_and_half_star_rating = 0;
        let total_one_star_rating = 0;
        let total_one_and_half_star_rating = 0;
        let total_2_star_rating = 0;
        let total_2_and_half_star_rating = 0;
        let total_3_star_rating = 0;
        let total_3_and_half_star_rating = 0;
        let total_4_star_rating = 0;
        let total_4_and_half_star_rating = 0;
        let total_5_star_rating = 0;


        // -- loop through each rating and increase the total rating accordingly --
        for(const review of product_reviews){
            switch(review.rating){
                case "0.5":
                total_zero_and_half_star_rating++;
                break;
                case "1":
                total_one_star_rating++;
                break;
                case "1.5":
                total_one_and_half_star_rating++;
                break;
                case "2":
                total_2_star_rating++;
                break;
                case "2.5":
                total_2_and_half_star_rating++;
                break;
                case "3":
                total_3_star_rating++;
                break;
                case "3.5":
                total_3_and_half_star_rating++;
                break;
                case "4":
                total_4_star_rating++;
                break;
                case "4.5":
                total_4_and_half_star_rating++;
                break;
                case "5":
                total_5_star_rating++;
                break;
            }
        }

        

        // -- Get the average star rating --
        let average_rating_for_this_product = (5*total_5_star_rating + 4.5*total_4_and_half_star_rating + 4*total_4_star_rating + 3.5*total_3_and_half_star_rating + 3*total_3_star_rating + 2.5*total_2_and_half_star_rating + 2*total_2_star_rating + 1.5*total_one_and_half_star_rating + 1*total_one_star_rating + 0.5*total_zero_and_half_star_rating)  / (total_5_star_rating+total_4_and_half_star_rating+total_4_star_rating+total_3_and_half_star_rating+total_3_star_rating+total_2_and_half_star_rating+total_2_star_rating+total_one_and_half_star_rating+total_one_star_rating+total_zero_and_half_star_rating)
        console.log("HEY", parseFloat(average_rating_for_this_product))
        
        return average_rating_for_this_product;
      
    },
    get_product_primary_image_and_average_rating: async (product) => {
        console.log("here is the value for the product that was passed ", product.id)
        // Get the primary image for this similar product and attached it to the sequelize virtual property called primary_iamge
        let primary_image_for_this_product = await Image.findOne({
            where: {
              productId: product.id
            }
          })
  
          product.primary_image = primary_image_for_this_product.firebaseImageURL
          
        // Calculate the average review for this product and attach it as a Sequelize virtual property
        let get_all_reviews_for_this_product = await Review.findAll({
            where: {
              productId: product.id
            }
          })
  
          let average_rating_for_this_product = await calculate_average_rating(get_all_reviews_for_this_product);
  
          product.average_rating = average_rating_for_this_product
          
          
          return product;
    }
    
}

module.exports = generalUtils
