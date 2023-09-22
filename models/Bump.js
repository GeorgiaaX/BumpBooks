const mongoose = require('mongoose')

const BumpSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bump: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Bump', BumpSchema)