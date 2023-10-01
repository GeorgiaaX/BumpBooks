//import mongoose library
const mongoose = require('mongoose')

//create new new mongoose Schema to track story bumps
const BumpSchema = new mongoose.Schema({
    //define a reference to "story" model using its objectID
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story", //reference to Story model
        required: true
    },
    //define a reference to "user" model using its objectID
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", //reference to user model
        required: true
    },
    //define a field to track if the story has been bumped by the user
    bump: {
        type: Boolean,
        default: false //by defualt, the field is set to false
    }
})

//export the mongoose model based on the bumpschema called bump
module.exports = mongoose.model('Bump', BumpSchema)