const express = require('express')
// const multer = require('multer')
// const sharp = require('sharp')
const User = require('../models/user')
const Token = require('../models/token')
// const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs') //used for hashing passwords
const userUtils = require('../utils/userUtils');

const auth = require('../middleware/auth')
const { sendWelcomeEmail, resetPassword } = require('../emails/EmailSender')
const router = new express.Router()

//create a user account along with their shopping cart
router.post('/users', async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 8)

        // make sure the billing address id is the highest value
        let userWithTheHighestBillingId = await User.max('billingId')


        req.body.billingId = userWithTheHighestBillingId + 1

        console.log("updated value for the billingId of a user ", req.body.password)


        // // Make sure the front end passed the shopId or it will crash. It can be in a invisible field
        const user = new User(req.body)

 
        await user.save()
 


        
        let token = await userUtils.generateAuthToken(user)
        sendWelcomeEmail(user.email, user.name, user.id, user.shopId)
        res.status(201).send({ user, token })
    } catch (e) {
        if(e.errors[0].path === "email_UNIQUE"){
            res.send({validationError: "The email you entered already exist."})
        }else if(e.errors[0].path === "password"){
            res.send({validationError: "The password must be between 5 to 20 characters."})
        }
        // // res.status(400).send({e: e.message})
        console.log("here is the error message ", e.errors)
    }
})

//login the user and generate an auth token for the user to perform authenticated actions.
router.post('/users/login', async (req, res) => {
        try{
            const user = await User.findOne({where: {email: req.body.email}}) //Look for the user profile by the email they entered when logging in
            await userUtils.findByCredentials(user, req.body.password) //Checks if the credentials they entered are valid
            const token = await userUtils.generateAuthToken(user) //Generate a user token so he/she can perform authenticated actions. Only if the above lines did not throw an error and triggered the catch block

            // res.setHeader('Set-Cookie', 'loggedIn=true') // I believe this never worked for me
            res.send({ user, token })
        }catch(e){
            res.status(400).send( {invalid: "The credentials you entered was invalid.", error: e})
            console.log("here is the error message ", e.message)
        }   
})

//logout the user and remove that specific token. reason we have an array of tokens is because each one is for each device that user log in with. so one can be the desktop the other could be from his tablet or phone.
router.post('/users/logout', auth, async (req, res) => {
    
    try {
        // The below line is used to find the token 
        let token = await Token.findOne({where: {userId: req.token.userId, token: req.token.token}})
        await token.destroy({force: true})
        
        await token.save()
        
        console.log("test")
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//logs out all the user from any device. like desktop, tablet etc. this is good for when you deleted an user account.
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        await Token.destroy({where: { userId: req.token.userId }}, {force: true})
       
        // await userNewTokenList.save() // I guess you don't have to save when you destroy something

        res.send({ message: "You have successfully deleted your account!"})
    } catch (e) {
        res.status(500).send()
    }
})

//get the user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Update the user 
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body) // Get the keys for the form data the frontend passed
    const allowedUpdates = ['name', 'email', 'password'] // These are the only keys youa accept as updates
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) // This line checks if the keys the user passed as form data matches the allowed updates

    // If the above line returned false then throw an error telling them they cannot update that. They are probably hacking
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        //I guess you can access properties using that syntax like an associative array. 
        updates.forEach((update) => req.user[update] = req.body[update]) // Update the user profile with the same key from the req.body which is the form data
        await req.user.save() // saving the user
        res.send(req.user) // Object destructuring
    } catch (e) {
        res.status(400).send(e)
    }
})

// *INCOMPLETE - DOES NOT WORK COME BACK TO THIS LATER TO FIX IT
//if the user wants to delete the account
router.delete('/users/me', auth, async (req, res) => {
    try {
        await User.destroy({where: { id: req.user.id }}, {force: true})
        console.log("does not run the above statement")

        // sendCancelationEmail(req.user.email, req.user.name) //when a user wants to delete his account thats what this route handler is doing. remember req.user value was set in the auth middle ware. then it was passed down to this route handler call back function which was the next argument. look at the auth middleware to get a better understanding. look at line 15 to see req.user value being set.
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

// You should use this API endpoint when a user signs up so they can verify their email before they can start using it
// In our database we have a column called verify. Don't know what exactly this is for but if it's used to prevent the user from using the site
// until he verifies then we should add this to our middleware to check everytime they do an action that require authentication. 
// if not and it's for just sending email to them we should work with that.
// The way this route handler functionw orks is that you are suppose to send a link to the user through email
// on that link when they click on it it takes you to the shopping cart site and when you load that page
// it sends a request to this API and this route handler function specifically. it has the user id passed
// as a parameter automatically. Look at the sendWelcomEmail() function in the custom module i created called emailSend.js file
router.patch('/users/verify/:id', async (req, res) => {
    const user = await User.findOne({where: {id: req.params.id}})
    user.verified = 1
    try {
        await user.save()

        res.send({message: "You have successfully verified your email!"})
    } catch (e) {
        res.status(400).send(e)
    }
})

// Reset the password for a certain user and give them a temp password and let him know what the temp password is by sending him an email
router.patch('/users/password/reset', async (req, res) => {
    try{
        const user = await User.findOne({where: {email: req.body.email}}) //find the user

        let tempPassword = await resetPassword(req.body.email, user.name) // Create a temp password and the password to the user by email to know what the temp password is
        console.log("here is the value for the temp password ", tempPassword)
        tempPassword = tempPassword.toString() //Make the temp password a string before it was a number because we used math.random and all kinds of stuff
        user.password = await bcrypt.hash(tempPassword, 8) // hash the password because we check the database by using the bcrypt library compare method when logging a user in

        await user.save() // save that hash new temp password to the user profile because he forgot his old password
    }catch(e){
        console.log(e)
    }
    

    
})


module.exports = router