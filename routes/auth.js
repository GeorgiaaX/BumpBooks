const express = require('express')
const passport = require('passport')
const validator = require('validator')
const router = express.Router()
const { ensureGuest } = require('../middleware/auth')

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

//@desc Login Auth
//route POST / login

router.post('/login', ensureGuest, (req, res, next) => {
    const validationErrors = []
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' })
    if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: 'Password cannot be blank.' })
    if (validationErrors.length) {
        req.flash('errors', validationErrors)
        return res.redirect('/login')
      }
      req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })

    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err) }
        if (!user) {
            req.flash('errors', info)
            return res.redirect('/login')
        }
        req.logIn(user, (err) => {
            if (err) { return next(err) }
            req.flash('success', { msg: 'Success! You are logged in.' })
            res.redirect(req.session.returnTo || '/dashboard')
         })
    })(req, res, next)
})


//@desc Signup Auth
//route POST / login
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
    req.flash('errors', validationErrors);
    return res.redirect('/signup'); // Change '../signup' to '/signup'
}

req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

try {
    const user = new User({
        displayName: req.body.displayName,
        email: req.body.email,
        password: req.body.password,
    });

    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
        req.flash('errors', { msg: 'Account with that email address already exists.' });
        return res.redirect('/signup'); 
    }

    await user.save();

    req.logIn(user, (err) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.redirect('/dashboard');
    });
} catch (error) {
    console.error(error);
    req.flash('errors', 'An error occurred during user registration.');
    res.redirect('/signup');
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

module.exports = router