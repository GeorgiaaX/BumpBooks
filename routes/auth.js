//Import required modules and dependencies
const express = require('express')
const passport = require('passport') // passport for authetication
const validator = require('validator') //validation library
const router = express.Router() 
const { ensureGuest } = require('../middleware/auth') //middleware for guestuser authentication

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
    //store validation errors in an array
    const validationErrors = [];
    
    // Normalize the email address, get rid of gmail dots
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })

    // Authenticate the user using Passport's local strategy
    passport.authenticate('local', (err, user) => {
        //if error return next route handler
        if (err) { return next(err) }
        if (!user) {
            // push error message to validationErrors array
            validationErrors.push({ msg: 'Invalid username or password.' });

            // Render the login template with validation errors
            return res.render('login', {
                layout: 'landing',
                validationErrors
            });
        }
        // If authentication succeeds, log in the user
        req.logIn(user, (err) => {
            //if error return next route handler
            if (err) { return next(err) }
            //if success redirect user to dashboard page
            res.redirect(req.session.returnTo || '/dashboard');
        });
    })(req, res, next);
});


//@desc route for user Signup Auth
//@route POST /signUp
router.post('/signUp', ensureGuest, async (req, res, next) => {
        //store validation errors in an array
        const validationErrors = [];
    
        //Validation checks, push error messages to validationErrors array
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
            // Pass validationErrors to the template
            return res.render('signUp',
            { layout: 'landing',
            validationErrors });
        }
    
    // Normalise the email address, remove dots from gmail address
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

    // Create a new user instance with the submitted data using the mongoose user schema
    try {
        const user = new User({
            displayName: req.body.displayName,
            email: req.body.email,
            password: req.body.password,
        });

        // Check if user with the same email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            //push error message to validationErrors array if user already exists
            validationErrors.push({ msg: 'Account with that email address already exists. Please proceed to Login' });
            return res.render('signUp',
            { layout: 'landing',
            validationErrors });
        }

        // Save the new user to the database
        await user.save();

        // Log in the user
        req.logIn(user, (err) => {
            if (err) {
                console.error(err);
                return next(err);
            }
            //redirect the use to the dashboard page once logged in
            res.redirect('/dashboard');
        });
    } catch (error) {
        //hanlde errors
        console.error(error);
        req.flash('errors', 'An error occurred during user registration.');
        res.redirect('/signUp');
    }
});


//@desc LogoutUser
//@Route /auth/logout
router.get('/logout', (req, res, next) => {
    //call the logout method provided by passport.js to logout the user
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        //destroy the user session
        req.session.destroy((err) => {
            if (err) {
                console.log('Error: Failed to destroy the session during logout.', err);
            }
            //set the user property to null to indicate the user is no longer authenticated
            req.user = null;
            //redirect to landing page after logout
            res.redirect('/');
        });
    });
});

//export the router for use in the main application
module.exports = router