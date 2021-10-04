const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');


const commentSchema = mongoose.Schema({
    blogId: {
        type: ObjectId,
        ref: 'Blog'
    },
    comments: [
        {
            commentBy: {
                type: ObjectId,
                ref: 'User'
            },
            content: {
                type: String
            },
            likes: [{
                type: ObjectId,
                ref: "User"
            }],

            updated: { type: Date, default: Date.now },

            replies: [{
                
                replyBy: { type: ObjectId, ref: "User" }, 
                replyContent: { type: String }, 
                likes: [{
                    type: ObjectId,
                    ref: "User"
                }], 
                updated: { type: Date, default: Date.now }
            }],
        }

    ]




}, { timestamps: true })



module.exports = mongoose.model('Comment', commentSchema);


