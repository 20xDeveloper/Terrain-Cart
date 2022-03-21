const express = require('express')
require('./db/sequelize')
const userRouter = require('./routers/user')
const cartRouter = require('./routers/cart')
const productRouter = require('./routers/product')
const apiAdminRouter = require('./routers/apiAdmin')
const orderRouter = require('./routers/order')
const categoryRouter = require('./routers/category')
const bannerRouter = require('./routers/banner')
const reviewRouter = require('./routers/review')


const cors = require('cors')

const auth = require("./middleware/auth")
const csrf = require('csurf');
const stripe = require('stripe')('sk_test_j4cqjsEDHggTyaDT3YH8heam00vVL03Y80')
const bodyParser = require('body-parser');

//models
const Item = require('./models/item')
const Product = require('./models/product')

//utils
const userUtils = require('./utils/userUtils');

const csrfProtection = csrf();
const app = express()
const port = process.env.PORT

const router = new express.Router()
const session = require('express-session'); //this is the session package to create a session
const uuid = require('uuid/v4')

const sequelize = require("./db/sequelize");

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  

  var sessionOptions = {
    key: 'session.sid',
    secret: 'Some secret key',
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 600000
    }
  };
  
  app.use(session(sessionOptions));



// uncomment the line below when you are ready to launch your api to production because we don't know how to send a csrf token from postman
// app.use(csrfProtection);

// Set up a whitelist and check against it:
// var whitelist = ['localhost:3000']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

app.use(cors())
app.use(userRouter)
app.use(cartRouter)
app.use(productRouter)
app.use(apiAdminRouter)
app.use(orderRouter)
app.use(categoryRouter)
app.use(bannerRouter)
app.use(reviewRouter)




app.listen(3000, () => {
  console.log('Server is up on port ' + port)
})