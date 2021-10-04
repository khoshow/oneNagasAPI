const Blog = require('../models/blog');
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



exports.listHello = (req, res) => {
    Blog.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .sort({ createdAt: -1 })
     
        .limit(3)
        .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
    console.log("hello");
};

exports.recentBlogs = (req, res) => {
    exports.listAllBlogsCategoriesTags = (req, res) => {
        let limit = req.body.limit ? parseInt(req.body.limit) : 10;
        let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    
        let blogs;
        let categories;
        let tags;
    
        Blog.find({})
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username profile')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
                blogs = data; // blogs
                // get all categories
                Category.find({}).exec((err, c) => {
                    if (err) {
                        return res.json({
                            error: errorHandler(err)
                        });
                    }
                    categories = c; // categories
                    // get all tags
                    Tag.find({}).exec((err, t) => {
                        if (err) {
                            return res.json({
                                error: errorHandler(err)
                            });
                        }
                        tags = t;
                        // return all blogs categories tags
                        res.json({ blogs, categories, tags, size: blogs.length });
                    });
                });
            });
    };
};

