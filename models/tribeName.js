const mongoose = require('mongoose');

const tribeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        slug: {
            type: String,
            unique: true,
            index: true
        }, 
        photo: {
            data: Buffer,
            contentType: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Tribe', tribeSchema);
