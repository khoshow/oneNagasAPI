const Tribe = require("../models/tribeName");
const Blog = require("../models/blog");
const slugify = require("slugify");
const formidable = require("formidable");
const fs = require("fs");
const _ = require('lodash');
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Could not  upload image",
      });
    }

    const { name } = fields;

    if (!name || !name.length) {
      return res.status(400).json({
        error: "Name is required",
      });
    }
    let slug = slugify(name).toLowerCase();
    let tribe = new Tribe();
    tribe.name = name;
    tribe.slug = slug;
    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          error: "Image should be less then 1mb in size",
        });
      } else {
        tribe.photo.data = fs.readFileSync(files.photo.path);
        tribe.photo.contentType = files.photo.type;
      }
    } else if (!files.photo) {
      return res.status(400).json({
        error: "An Image is required",
      });
    }

    tribe.save((err, data) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data); // dont do this res.json({ tribe: data });
    });
  });
};

exports.list = (req, res) => {
  Tribe.find({}).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
};

// exports.photo = (req, res) => {
//     const username = req.params.username;
//     User.findOne({ username }).exec((err, user) => {
//         if (err || !user) {
//             return res.status(400).json({
//                 error: "User Not found"
//             })
//         }
//         if (user.photo.data) {
//             res.set("Content-Type", user.photo.contentType);
//             return res.send(user.photo.data)
//         }
//     })
// }

exports.photo = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Tribe.findOne({ slug }).exec((err, tribe) => {
    if (err || !tribe) {
      return res.status(400).json({
        error: "tribe Not found",
      });
    }
    if (tribe.photo.data) {
      res.set("Content-Type", tribe.photo.contentType);

      return res.send(tribe.photo.data);
    }
  });
};

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  Tribe.findOne({ slug }).exec((err, tribe) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    Blog.find({ tribes: tribe })
      .populate("tribes", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("categories", "_id name slug")
      .populate("postedBy", "_id name")
      .select(
        "_id title slug excerpt categories postedBy tribes tags createdAt updatedAt"
      )
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json({ tribe: tribe, blogs: data });
      });
  });
};

exports.remove = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  Tribe.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "Tribe deleted successfully",
    });
  });
};

exports.update = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Tribe.findOne({ slug }).exec((err, oldTribe) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "Image could not upload",
        });
      }

      let slugBeforeMerge = oldTribe.slug;
      oldTribe = _.merge(oldTribe, fields);
      oldTribe.slug = slugBeforeMerge;

      // const { body, name } = fields;

      if (files.photo) {
        if (files.photo.size > 10000000) {
          return res.status(400).json({
            error: "Image should be less then 1mb in size",
          });
        }
        oldTribe.photo.data = fs.readFileSync(files.photo.path);
        oldTribe.photo.contentType = files.photo.type;
      }

      oldTribe.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        // result.photo = undefined;
        res.json(result);
      });
    });
  });
};
