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


exports.postComment = (req, res) => {
    // console.log("Blog Id from back: " + req.body.blogId);
    // console.log("Content from back: " + req.body.comment);
    const blogId = req.body.blogId
    // console.log("bg:" + blogId);
    Comment.findOne({ blogId: blogId }).exec((err, data) => {
        if (data) {
            Comment.findOneAndUpdate({ blogId: blogId }, {
                $push: { comments: [{ "commentBy": req.profile._id, "content": req.body.comment }] }
            }, { "new": true }
            ).populate({
                path: 'comments.commentBy',
                select: '_id name username',
                model: 'User'
            })
                .exec((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    } else {
                        res.json(result);
                    }
                })
        } else if (!data) {
            Comment.create({
                blogId: blogId, comments: [{
                    commentBy: req.profile._id,
                    content: req.body.comment
                }]
            }, function (err, small) {
                if (err) return handleError(err);
                // saved!
            });
        }
    })
}


// exports.postReply = (req, res) => {
//     const commentId = req.body.commentId
//     const blogId = req.body.blogId
//     Comment.findOneAndUpdate({ blogId: blogId },
//         { $push: { "comments.$[elem].replies": { "replyContent": req.body.content, "replyBy": req.profile._id } } },
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

exports.likeComment = (req, res) => {
    const blogId = req.body.blogId
    const commentId = req.body.commentId
    Comment.findOneAndUpdate({ blogId: blogId },
        { $push: { "comments.$[elem].likes": req.profile._id } },
        { arrayFilters: [{ "elem._id": commentId }] })
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

exports.unlikeComment = (req, res) => {
    const blogId = req.body.blogId
    const commentId = req.body.commentId
    Comment.findOneAndUpdate({ blogId: blogId },
        { $pull: { "comments.$[elem].likes": req.profile._id } },
        { arrayFilters: [{ "elem._id": commentId }] }
    ).exec({ new: true }, (err, result) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        } else (
            res.json(result)
        )
    })


    // .exec((err, result) => {
    //     if (err) {
    //         return res.status(400).json({
    //             error: errorHandler(err)
    //         });
    //     } else {
    //         res.json(result);
    //     }
    // })

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

// exports.likeBlog = (req, res) => {
//     const myId = req.body.blogId
//     console.log("from back: " + myId);
//     Blog.findByIdAndUpdate({ _id: myId }, {
//         $push: { likes: req.profile._id }
//     }, {
//         new: true
//     }).exec((err, result) => {
//         if (err) {
//             return res.status(400).json({
//                 error: errorHandler(err)
//             });
//         } else (
//             res.json(result)
//         )
//     })

// }

exports.getComments = (req, res) => {
    const blogId = req.params.slug
    Comment.findOne({ blogId: blogId })
        .populate({
            path: 'comments.commentBy',
            select: '_id name username',
            model: 'User'
        })
        .populate({
            path: 'comments.likes',
            model: 'User'
        })
        .populate({
            path: 'comments.replies.likes',
            select: '_id name username',
            model: 'User'

        })
        .populate({
            path: 'comments.replies.replyBy',
            model: 'User'

        })
        // .select('_id blogId comments comments.content comments.commentBy  comments.replies.replyContent')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            // console.log("From back: " + data);
            res.json(data);
        });
}

// exports.getComments =(req, res)=>{
// const blogId = req.params.slug
// Comment.findOne({blogId:blogId}, (err, data)=>{
//     if(err){
//         return res.status(400).json({
//             error: errorHandler(err)
//         });
//     }else res.json(data)
// })
// }

// ,
// { $push: { "comments.$[elem].likes": req.profile._id } },
// { arrayFilters: [{ "elem._id": commentId }] })

exports.editComment = (req, res) => {
    // console.log("Blog Id from back: " + req.body.blogId);
    // console.log("Content from back: " + req.body.comment);
    const blogId = req.body.blogId
    const commentId = req.body.commentId
    console.log("bg:" + blogId);
    Comment.findOneAndUpdate({ blogId: blogId },
        { "comments.$[elem].content": req.body.content },
        { arrayFilters: [{ "elem._id": commentId }] })
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


exports.deleteComment = (req, res) => {
    const blogId = req.body.blogId
    const commentId = req.body.commentId
    Comment.findOneAndUpdate({ blogId: blogId },
        { $pull: { "comments": { _id: commentId } } })        
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
