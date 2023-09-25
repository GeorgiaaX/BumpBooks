//Import required modules and dependencies
const express = require('express')
const passport = require('passport') // passport for authetication
const validator = require('validator') //validation library
const router = express.Router() 
const { ensureGuest } = require('../middleware/auth') //middleware for guest user

//import user model
const User = require('../models/User')


//@desc Auth with Google
//@Route GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile']}))

//@desc Google auth callback
//@Route GET /auth/google/callback
router.get('/google/callback', 
passport.authenticate('google', {failureRedirect: '/'}), (req,res) => {
    res.redirect('/dashboard')
}
)

//@desc route for user Login Auth
//route POST / login

router.post('/login', ensureGuest, (req, res, next) => {
    const validationErrors = []

    //validation checks
    if (!validator.isEmail(req.body.email)) {
        validationErrors.push({ msg: 'Please enter a valid email address.' })
    }
    if (validator.isEmpty(req.body.password)) {
        validationErrors.push({ msg: 'Password cannot be blank.' })
    }

    //if there are validation errors, flash them and redirect to the login page
    if (validationErrors.length) {
        req.flash('errors', validationErrors)
        return res.redirect('/login')
      }

      //normalise the email address, get rid of gmail dots
      req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })

      //Authenticaate the user using Passport's local strategy
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err) }
        if (!user) {
            //if authentication fails, flash an error message and redirect to the login page
            req.flash('errors', info)
            return res.redirect('/login')
        }
        //if authentication succeeds, log in the user
        req.logIn(user, (err) => {
            if (err) { return next(err) }
            //Flash a success message and redirect to the user's dashboard
            req.flash('success', { msg: 'Success! You are logged in.' })
            res.redirect(req.session.returnTo || '/dashboard')
         })
    })(req, res, next)
})


//@desc route for user Signup Auth
//@route POST /signUp
router.post('/signUp', ensureGuest, async (req, res, next) => {
    const validationErrors = [];

    // Validation checks
    if (!validator.isEmail(req.body.email)) {
        validationErrors.push({ msg: 'Please enter a valid email address.' });
    }
    if (!validator.isLength(req.body.password, { min: 8 })) {
        validationErrors.push({ msg: 'Password must be at least 8 characters long' });
    }
    if (req.body.password !== req.body.confirmPassword) {
        validationErrors.push({ msg: 'Passwords do not match' });
    }

    if (validationErrors.length > 0) {
        req.flash('errors', validationErrors); // Store validation errors in flash
        return res.redirect('/signUp');
    }

    // Normalise the email address, remove dots from gmail address
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

    // Create a new user instance with the submitted data
    try {
        const user = new User({
            displayName: req.body.displayName,
            email: req.body.email,
            password: req.body.password,
        });

        // Check if user with the same email already exists, flash an error and redirect to signup page
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists.' });
            return res.redirect('/signUp'); 
        }

        // Save the new user to the database
        await user.save();

        // Log in the user
        req.logIn(user, (err) => {
            if (err) {
                console.error(err);
                return next(err);
            }
            // Flash success message
            req.flash('success', 'Registration successful!');
            res.redirect('/dashboard');
        });
    } catch (error) {
        console.error(error);
        req.flash('errors', 'An error occurred during user registration.');
        res.redirect('/signUp');
    }
});



//@desc LogoutUser
//@Route /auth/logout
router.get('/logout', (req, res, next) => {

    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                console.log('Error: Failed to destroy the session during logout.', err);
            }
            req.user = null;
            res.redirect('/');
        });
    });
});

//export the router for use in the main application
module.exports = router