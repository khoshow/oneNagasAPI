const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            index: true
        },
        body: {
            type: {},
            required: true,
            min: 200,
            max: 2000000
        },
        excerpt: {
            type: String,
            max: 1000
        },
        mtitle: {
            type: String
        },
        mdesc: {
            type: String
        },
        photo: {
            data: Buffer,
            contentType: String
        },
        caption: {
            type: String,
            max: 100
        },
        likes: [{
            type: ObjectId,
            ref: "User"
        }],
        categories: [{ type: ObjectId, ref: 'Category', required: true }],
        tags: [{ type: ObjectId, ref: 'Tag', required: true }],
        tribes: [{ type: ObjectId, ref: 'Tribe', required: true }],
        postedBy: {
            type: ObjectId,
            ref: 'User'
        },
        // comment: [{
        //     commentBy: {
        //         type: ObjectId,
        //         ref: 'User'
        //     },
        //     postId: {
        //         type: ObjectId,
        //         ref: 'Blog'
        //     },
        //     content: {
        //         type: String
        //     },

        //     replies: [{ replyTo: { type: ObjectId, ref: "Comment" }, replyBy: { type: ObjectId, ref: "User" }, content: { type: String } }, { timestamps: true }]
        // }, { timestamps: true }]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
