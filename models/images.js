const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        max: 32
    },
    photo: {
        data: Buffer,
        contentType: String
    }
})

module.exports = mongoose.model('Image', imageSchema);