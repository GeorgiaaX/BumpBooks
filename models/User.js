//import modules
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

//define a new mongoose schema for creating user documents
const UserSchema = new mongoose.Schema({
    //if using google auth, define a google ID
    googleId: {
        type: String,
    },
    //define a displayName
    displayName: {
        type: String,
        required: true
    },
    //define an email address
    email: {
        type: String,
    },
    //define a password
    password: {
        type: String
    },
    //define an image URL
    image: {
        type: String,
        default: '/images/avatar.png' //default imgae URL
    },
    //define a time of new user creation
    createdAt: {
        type: Date,
        default: Date.now //default time is set to the current time
    },
    //define a profile description
    profileDesc: {
        type: String,
        default: "<p>Hi, thanks for visiting my profile. Enjoy reading my stories!</p>" //deault profile description
    }
})

//password hash middleware
UserSchema.pre('save', function save(next) {
    const user = this
    if(!user.isModified('password')) {
        return next()
    }
    bcrypt.genSalt(10, (err, salt) => {
        if(err) { return next(err) }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if(err) {return next (err) }
            user.password = hash
            next()
        })
    })
})

//Helper method for validating user's password
UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

//export the mongoose sechema using the Userschema called user
module.exports = mongoose.model('User', UserSchema)
