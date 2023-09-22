const mongoose = require('mongoose')

const StorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    tags: {
        type: String,
        default: 'general',
        enum: ['general', 'romance', 'fantasy', 'sci-fi', 'mystery', 'horror', 'comedy']
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'public',
        enum: ['public', 'private']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bumps: {
        type: Number,
        default: 0
    }, 
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Story', StorySchema)