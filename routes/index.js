const express = require('express')
const router = express.Router()
const {ensureAuth, ensureGuest} = require('../middleware/auth')

//require models
const Story = require('../models/Story')
const User = require('../models/User')

//@desc Landing Page
//@router GET /
//change layout to login
router.get('/', ensureGuest, (req, res) => {
    res.render('landing', {
        layout: 'landing',
    })
})

//@desc Login page
//@route GET /login
router.get('/login', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'landing'
    })
})

//@desc Sign Up page
//@route GET /signUp
router.get('/signUp', ensureGuest, (req, res) => {
    res.render('signUp', {
        layout: 'landing'
    })
})


//@desc display Privacy Policy
//@route GET /profile
router.get('/privacy', ensureGuest, (req, res) => {
    res.render('privacyPolicy', {
        layout: 'landing',
    })
})


//@desc Dashboard
//@router GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.user.id
        }).lean()
        res.render('dashboard', {
            name: req.user.displayName,
            profileDesc: req.user.profileDesc,
            stories
        })
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})

//@desc Dashboard profile text
//@router PUT /dashboard/

router.put('/dashboard', ensureAuth, async (req, res) => {
    try {
        const updatedProfileDesc = req.body.profileDesc;
        const user = await User.findByIdAndUpdate(req.user.id, { profileDesc: updatedProfileDesc }, {
            new: true,
            runValidators: true,
        });
        if (!user) {
            return res.render('error/404');
        }
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
})

//@desc Profile
//@route GET /profile
router.get('/userProfile', ensureAuth, async (req, res)=> {
    try {
        const stories = await Story.find({
            user: req.user.id
        }).lean()
        res.render('userProfile', {
            name: req.user.displayName,
            profileDesc: req.user.profileDesc,
            stories
        })
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})

module.exports = router