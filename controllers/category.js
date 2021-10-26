const Category = require("../models/category");
const Blog = require("../models/blog");
const slugify = require("slugify");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");
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
    let category = new Category();
    category.name = name;
    category.slug = slug;
    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          error: "Image should be less then 1mb in size",
        });
      } else {
        category.photo.data = fs.readFileSync(files.photo.path);
        category.photo.contentType = files.photo.type;
      }
    } else if (!files.photo) {
      return res.status(400).json({
        error: "An Image is required",
      });
    }

    category.save((err, data) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data); // dont do this res.json({ category: data });
    });
  });
};

exports.list = (req, res) => {
  Category.find({}).exec((err, data) => {
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
  Category.findOne({ slug }).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: "Category not found",
      });
    }
    if (category.photo.data) {
      res.set("Content-Type", category.photo.contentType);

      return res.send(category.photo.data);
    }
  });
};

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  Category.findOne({ slug }).exec((err, category) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    Blog.find({ categories: category })
      .populate("tribes", "_id name slug")
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name")
      .select(
        "_id title slug excerpt categories postedBy tags createdAt updatedAt"
      )
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json({ category: category, blogs: data });
      });
  });
};

exports.remove = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  Category.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "Category deleted successfully",
    });
  });
};

// exports.update = (req, res) => {
//   const slug = req.params.slug.toLowerCase();

//   Category.findOne({ slug }).exec((err, oldCategory) => {
//     if (err) {
//       return res.status(400).json({
//         error: errorHandler(err),
//       });
//     }
//     let form = new formidable.IncomingForm();
//     form.keepExtensions = true;

//     form.parse(req, (err, fields, files) => {
//       if (err) {
//         return res.status(400).json({
//           error: "Image could not upload",
//         });
//       }

//       let slugBeforeMerge = oldCategory.slug;
//       oldCategory = _.merge(oldCategory, fields);
//       oldCategory.slug = slugBeforeMerge;

//       const { name } = fields;

//       if (name) {
//         console.log("Name oif Cat: "+ name);
//         oldCategory.name = name

//       }

//       if (files.photo) {
//         if (files.photo.size > 10000000) {
//           return res.status(400).json({
//             error: "Image should be less then 1mb in size",
//           });
//         }
//         oldCategory.photo.data = fs.readFileSync(files.photo.path);
//         oldCategory.photo.contentType = files.photo.type;
//       }

//       oldCategory.save((err, result) => {
//         if (err) {
//           return res.status(400).json({
//             error: errorHandler(err),
//           });
//         }
//         // result.photo = undefined;

//         res.json(result);
//       });
//     });
//   });
// };

exports.update = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Category.findOne({ slug }).exec((err, oldCategory) => {
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
          error: "Could not  upload image",
        });
      }

      const { name } = fields;

      if (!name || !name.length) {
        return res.status(400).json({
          error: "Name is required",
        });
      }
     
      let slugBeforeMerge = oldCategory.slug;
            oldCategory = _.merge(oldCategory, fields);
            oldCategory.slug = slugBeforeMerge;





      // let category = new Category();
      // category.name = name;
      // category.slug = slug;
      if (files.photo) {
        if (files.photo.size > 10000000) {
          return res.status(400).json({
            error: "Image should be less then 1mb in size",
          });
        } else {
          oldCategory.photo.data = fs.readFileSync(files.photo.path);
          oldCategory.photo.contentType = files.photo.type;
        }
      } else if (!files.photo) {
        return res.status(400).json({
          error: "An Image is required",
        });
      }

      oldCategory.save((err, data) => {
        if (err) {
          console.log(err);
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(data); // dont do this res.json({ category: data });
      });
    });
  });
};
