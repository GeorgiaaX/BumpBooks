//import modules and dependencies
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')

//export a function that handles a local strategy for authorisation using passport.js
module.exports = function (passport) {
  //create a new User model
  passport.use(new LocalStrategy({ 
      usernameField: 'email' }, 
      async (email, password, done) => 
      {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return done(null, false, { msg: `Email ${email} not found.` });
      }
      const isMatch = await user.comparePassword(password);

      if (isMatch) {
        return done(null, user);
      }

      return done(null, false, { msg: 'Invalid email or password.' });
    } catch (err) {
      console.error(err);
      return done(err);
    }
  }));
  //serialize user data to store in sessions
  passport.serializeUser((user, done) => {
    done(null, user.id) //serialize using user ID
  })
  //deserialize user data to retrieve from sessions
  passport.deserializeUser((id, done) => {
    //find user in the data base using user ID
    User.findById(id, (err, user) => done(err, user))
  })
}