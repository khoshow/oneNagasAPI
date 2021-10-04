const mongoose = require('mongoose');

const writerPickSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            trim: true,
            required: true,
            max: 32,
            unique: true,
            index: true,
            lowercase: true
        },
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        profile: {
            type: String,
            required: true
        },
        photo: {
            data: Buffer,
            contentType: String
        },
        about: {
            type: String
        }
        // ,
        //  expire_at: { type: Date, default: Date.now, expires: 5000 }
       
    },
    { timestamp: true }
);



module.exports = mongoose.model('WriterPick', writerPickSchema);