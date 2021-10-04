const WriterPick = require('../models/writerPick');
const WritersPopular = require('../models/writersPopular')
const User = require('../models/user');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');
const Blog = require('../models/blog');
const EditorsPicksBlogs = require("../models/blogsEditorsPick")

exports.createWriterPick = (req, res) => {
    User.findOne({ username: req.params.selectedWriter }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        } else if (!user) {
            return console.log("No such name exist");
        }

        let userId = user._id;
        let username = user.username;
        let name = user.name;
        let profile = user.profile;
        let photo = user.photo
        let about = user.about
        
        let writer = new WriterPick({ userId, username, name, profile, photo, about })
        writer.save((err, data) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }

            res.json(data)
        })

    })

};

exports.list = (req, res) => {
    WriterPick.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        res.json(data);

    });
};


// Writers Populars


exports.createWriterPopular = (req, res) => {
    User.findOne({ username: req.params.username }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        } else if (!user) {
            return console.log("No such name exist");
        }

        let userId = user._id;
        let username = user.username;
        let name = user.name;
        let profile = user.profile;
        let photo = user.photo
        let about = user.about
        let writer = new WritersPopular({ userId, username, name, profile, photo, about })
        writer.save((err, data) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }

            res.json(data)
        })

    })

};


exports.listPopularWriters = (req, res) => {
    WritersPopular.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        console.log(data[0]);
        res.json(data);

    });
};


exports.createEditorsPicks = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug }).exec((err, blog) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        let title = blog.title;
        let slug = blog.slug;
        let body = blog.body;
        let excerpt = blog.excerpt;
        let mtitle = blog.mtitle;
        let mdesc = blog.mdesc;
        let photo = blog.photo;
        let categories = blog.categories;
        let tags = blog.tags;
        let tribes = blog.tribes;
        let postedBy = blog.postedBy

        let editorsPicks = new EditorsPicksBlogs({
            title,
            slug,
            body,
            excerpt,
            mtitle,
            mdesc,
            photo,
            categories,
            tags,
            tribes,
            postedBy
        })
        editorsPicks.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }else{
               
                res.json(result);
            }
           

        })
    })

}
exports.listEditorsPicks = (req, res) => {
    EditorsPicksBlogs.find({})
    .populate('postedBy', '_id name username')
    .exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
     
        res.json(data);

    });
        }