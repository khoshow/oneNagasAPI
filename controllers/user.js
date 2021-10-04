const User = require("../models/user");
const Blog = require("../models/blog");
const { errorHandler } = require("../helpers/dbErrorHandler");
const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};

exports.publicProfile = (req, res) => {
  let username = req.params.username;
  let user;
  let blogs;

  User.findOne({ username })
    .populate("follows", "_id name username")
    .populate("followers", "_id name username")
    .exec((err, userFromDB) => {
      if (err || !userFromDB) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      user = userFromDB;
      let userId = user._id;
      Blog.find({ postedBy: userId })
        .populate("categories", "_id name slug")
        .populate("tags", "_id name slug")
        .populate("postedBy", "_id name")
        .populate("follows", "_id name username")
        .populate("followers", "_id name username")
        .limit(10)
        .select(
          "_id title slug excerpt categories tags postedBy createdAt updatedAt follows followers"
        )
        .exec((err, data) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err),
            });
          }
          user.photo = undefined;
          user.hashed_password = undefined;
          res.json({
            user,
            blogs: data,
          });
        });
    });
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtension = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded",
      });
    }
    let user = req.profile;
    user = _.extend(user, fields);

    if (fields.password && fields.password.length < 6) {
      return res.status(400).json({
        error: "Password should be minimum 6 characters long",
      });
    }

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb",
        });
      }
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;
    }

    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      user.hashed_password = undefined;
      user.photo = undefined;
      user.salt = undefined;
      res.json(user);
    });
  });
};

exports.photo = (req, res) => {
  const username = req.params.username;
  User.findOne({ username }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User Not found",
      });
    }
    if (user.photo.data) {
      res.set("Content-Type", user.photo.contentType);
      return res.send(user.photo.data);
    }
  });
};

exports.list = (req, res) => {
  User.find({}).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
};

exports.follows = (req, res) => {
  // const follower = req.body.follower
  const follows = req.body.follows;

  console.log("from back follower: " + req.profile._id);
  console.log("from back follows: " + follows);

  User.findByIdAndUpdate(
    { _id: follows },
    {
      $push: { followers: req.profile._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    } else
      User.findByIdAndUpdate(
        { _id: req.profile._id },
        {
          $push: { follows: follows },
        },
        {
          new: true,
        }
      ).exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        } else res.json(data);
      });
  });
};

exports.unFollow = (req, res) => {
  // const follower = req.body.follower
  const unfollow = req.body.unfollow;

  console.log("from back follower: " + req.profile._id);
  console.log("from back follows: " + unfollow);

  User.findByIdAndUpdate(
    { _id: unfollow },
    {
      $pull: { followers: req.profile._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    } else
      User.findByIdAndUpdate(
        { _id: req.profile._id },
        {
          $pull: { follows: unfollow },
        },
        {
          new: true,
        }
      ).exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        } else res.json(data);
      });
  });
};
