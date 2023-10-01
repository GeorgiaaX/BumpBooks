//Import modules
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')

//export a function that configues passport.js for google auth
module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        //use GOOGLE_CLIENT_ID from environmnet variables
        clientID: process.env.GOOGLE_CLIENT_ID,
        //use GOOGLE_CLIENT_SECRET from environmnet variables
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        //define the callback URL for successful authentication
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        //new User model
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }

        //check if user exists, create new user if not
        try {
            let user = await User.findOne({googleId: profile.id})
            //if user exists, pass the user back to the passport done() callback
            if(user) {
                done(null, user)
            //if user doesn't exist, create a new user in the database and then pass it to passports done() callback 
            } else {
                user = await User.create(newUser)
                done(null, user)
            }
            //catch errors and console.log
        } catch (err) {
            console.error(err)
        }
    }))
    //serialize user data to store in sessions
    passport.serializeUser((user,done) => {
        done(null, user.id) //serialize using user ID
    });
    //deserialize user data to retreive it from sessions
    passport.deserializeUser(async function (id, done) {
        try {
            //find the user in the database by their ID
            const user = await User.findById(id);
            //pass the user to passports done() callback
            done(null, user);
            //catch errors and console.log
        } catch (err) {
            console.error(err);
        }
  });

    }