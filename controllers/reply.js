const Comment = require('../models/comment');
const Category = require('../models/category');
const Tag = require('../models/tag');
const User = require('../models/user');
const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/blog');




// exports.postReply = (req, res) => {
//     const commentId = req.body.commentId
//     const blogId = req.body.blogId
//     Comment.findOneAndUpdate({ blogId: blogId },
//         { $push: { "comments.$[elem].replies": { "replyContent": req.body.reply, "replyBy": req.profile._id } } },
//         { arrayFilters: [{ "elem._id": commentId }] }
//     ).exec((err, result) => {
//         if (err) {
//             return res.status(400).json({
//                 error: errorHandler(err)
//             });
//         } else {
//             res.json(result);
//         }
//     })
// }



exports.postReply = (req, res) => {
    const commentId = req.body.commentId
    const blogId = req.body.blogId
    Comment.findOneAndUpdate({ blogId: blogId },
        { $push: { "comments.$[elem].replies": { "replyContent": req.body.reply, "replyBy": req.profile._id } } }, 
        {new:true, arrayFilters: [{ "elem._id": commentId }]}
     
    ).populate({
        path: 'comments.replies.replyBy',
        select: '_id name username',
        model: 'User'
    }).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        } else {
            res.json(result);
        }
    })
}




exports.likeReply = (req, res) => {
    const blogId = req.body.blogId
    const replyId = req.body.replyId
    Comment.findOneAndUpdate({ blogId: blogId },
        { $push: { "comments.0.replies.$[elem].likes": req.profile._id } },
        { arrayFilters: [{ "elem._id": replyId }] })
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            } else (
                { new: true },
                res.json(result)
            )
        })
}
exports.unlikeReply = (req, res) => {
    const blogId = req.body.blogId
    const replyId = req.body.replyId
    Comment.findOneAndUpdate({ blogId: blogId },
        { $pull: { "comments.0.replies.$[elem].likes": req.profile._id } },
        { arrayFilters: [{ "elem._id": replyId }] })
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            } else (
                { new: true },
                res.json(result)
            )
        })
}



exports.editReply = (req, res) => {
    console.log("Blog Id from back: " + req.body.blogId);
    console.log("Content from back: " + req.body.content);
    const blogId = req.body.blogId
    const replyId = req.body.replyId
    console.log("bg:" + blogId);
    Comment.findOneAndUpdate({ blogId: blogId },
        { "comments.0.replies.$[elem].replyContent": req.body.content },
        { arrayFilters: [{ "elem._id": replyId }] })
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            } else {
                res.json(result);
            }
        })


}


exports.deleteReply = (req, res) => {
    const blogId = req.body.blogId
    const replyId = req.body.replyId
    Comment.findOneAndUpdate({ blogId: blogId },
        { $pull: { "comments.0.replies": { _id: replyId } } })        
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            } else (
                { new: true },
                res.json(result)
            )
        })
}


exports.getReplies = (req, res) => {
    const blogId = req.body.blogId

}