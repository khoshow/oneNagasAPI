const Tag = require('../models/tag');
const slugify = require('slugify');
const formidable = require('formidable');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const blog = require('../models/blog');

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    console.log(form);
    
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not  upload image'
            });
        }

        const { name } = fields;
        
        if (!name || !name.length) {
            return res.status(400).json({
                error: 'Name is required'
            });
        }
        let slug = slugify(name).toLowerCase();
        let tag = new Tag({ name, slug });
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            tag.photo.data = fs.readFileSync(files.photo.path);
            tag.photo.contentType = files.photo.type;
        }else if(!files.photo){
            return res.status(400).json({
                error: 'An Image is required'
            });
        }


        tag.save((err, data) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(data); // dont do this res.json({ tag: data });
        });
    })
 
};

exports.list = (req, res) => {
    Tag.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};


exports.photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Tag.findOne({ slug }).exec((err, tag) => {
      if (err || !tag) {
        return res.status(400).json({
          error: "Tag not found",
        });
      }
      if (tag.photo.data) {
        res.set("Content-Type", tag.photo.contentType);
  
        return res.send(tag.photo.data);
      }
    });
  };


exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tag.findOne({ slug }).exec((err, tag) => {
        if (err) {
            return res.status(400).json({
                error: 'Tag not found'
            });
        }
        blog.find({tags: tag})
        .populate('categories', '_id name photo slug')
        .populate('tags', '_id name photo slug')
        .populate('postedBy', '_id name')
        .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
        .exec((err, data)=>{
            if(err){
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json({tag:tag, blogs: data})
        })
    });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tag.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Tag deleted successfully'
        });
    });
};



exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Tag.findOne({ slug }).exec((err, oldTag) => {
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
  
        let slugBeforeMerge = oldTag.slug;
        oldTag = _.merge(oldTag, fields);
        oldTag.slug = slugBeforeMerge;
  
        // const { body, name } = fields;
  
        if (files.photo) {
          if (files.photo.size > 10000000) {
            return res.status(400).json({
              error: "Image should be less then 1mb in size",
            });
          }
          oldTag.photo.data = fs.readFileSync(files.photo.path);
          oldTag.photo.contentType = files.photo.type;
        }
  
        oldTag.save((err, result) => {
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