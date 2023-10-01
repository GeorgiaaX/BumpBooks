//import modules
const express = require('express')
const router = express.Router()
const {ensureAuth, ensureGuest} = require('../middleware/auth') //middleware for checking authentication

//require models
const Story = require('../models/Story')
const User = require('../models/User')

//@desc Landing Page
//@router GET /
router.get('/', ensureGuest, (req, res) => {
    //render landing page if user is not authenticated
    res.render('landing', {
        layout: 'landing',
    })
})

//@desc Login page
//@route GET /login
router.get('/login', ensureGuest, (req, res) => {
    //render login page if user is not authenticated
    res.render('login', {
        layout: 'landing'
    })
})

//@desc Sign Up page
//@route GET /signUp
router.get('/signUp', ensureGuest, (req, res) => {
    //render signup page if user is not authenticated
    res.render('signUp', {
        layout: 'landing'
    })
})


//@desc display Privacy Policy
//@route GET /profile
router.get('/privacy', ensureGuest, (req, res) => {
    //render privacy policy page if user is not authenticated
    res.render('privacyPolicy', {
        layout: 'landing',
    })
})


//@desc Dashboard
//@router GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    //ensure user is authenticated
    try {
        //find all stroies wuth the user id matching the authenticated user's id
        const stories = await Story.find({
            user: req.user.id
        }).lean()
        //render the user dashboard page, passing in user displayName, profile description and stories
        res.render('dashboard', {
            name: req.user.displayName, //user display Name
            profileDesc: req.user.profileDesc, //user profile description
            stories //user stories
        })
    } catch (err) {
        //handle errors
        console.log(err)
        res.render('error/500')
    }
})

//@desc Dashboard update profile text
//@router PUT /dashboard/
router.put('/dashboard', ensureAuth, async (req, res) => {
    //ensure user is authenticated using ensureAuth middleware
    try {
        //store the updated profile description from the request body in a variable
        const updatedProfileDesc = req.body.profileDesc;
        //find the user Id and update the profile description
        const user = await User.findByIdAndUpdate(
            req.user.id, //user id
            { profileDesc: updatedProfileDesc }, //update profile description field
            {
            new: true, //return the updated document
            runValidators: true, //run validation checks on the update
        });
        if (!user) {
            //if user is not found, run 404
            return res.render('error/404');
        }
        //redirect back to user dashboard after profile description update
        res.redirect('/dashboard')
    } catch (err) {
        //handle errors
        console.error(err);
        res.render('error/500');
    }
})

//@desc Display user profile with stories and profile description
//@route GET /profile
router.get('/userProfile', ensureAuth, async (req, res)=> {
    //ensure user is authenticated using ensureAuth middleware
    try {
        //find stories in the database with the user id that matches the authenticated user id
        const stories = await Story.find({
            user: req.user.id //user id
        }).lean()
        //render the user profile page, passing in displayname, profile description and stories
        res.render('userProfile', {
            name: req.user.displayName, //user displayname
            profileDesc: req.user.profileDesc, //user profile description
            stories //user stories
        })
    } catch (err) {
        //handle errors
        console.log(err)
        res.render('error/500')
    }
})

//export the router
module.exports = router