//import the mongoose library
const mongoose = require('mongoose')

//create a mongoose schema to define the structure of new stories
const StorySchema = new mongoose.Schema({
    //define a title for the story
    title: {
        type: String,
        required: true,
        trim: true, //trim whitespace from the title
    },
    //define a description for the story
    description: {
        type: String,
        required: true,
    },
    //define tags for the story
    tags: {
        type: String,
        default: 'general', //default is set to general
        enum: ['general', 'romance', 'fantasy', 'sci-fi', 'mystery', 'horror', 'comedy'] //allowed tag values
    },
    //define a body for the story
    body: {
        type: String,
        required: true
    },
    //define a status for the story
    status: {
        type: String,
        default: 'public', //default is set to public
        enum: ['public', 'private'] //allowed values
    },
    //define a reference to the user model using its objectID
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", //reference to the user model
        required: true
    },
    //define the number of bumps
    bumps: {
        type: Number,
        default: 0 //default is set to 0
    }, 
    //define an image URL for the story
    image: {
        type: String,
    },
    //define a date of story creation
    createdAt: {
        type: Date,
        default: Date.now //default creation date is set to current
    },
})
    //export a mongoose model based on the storySchema called story
module.exports = mongoose.model('Story', StorySchema)