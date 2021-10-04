const TempImage = require('../models/tempPhoto');
const formidable = require('formidable');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');


exports.tempPhoto = (req, res) => {
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
        
        let tempPhoto = new TempImage({ name });
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            tempPhoto.photo.data = fs.readFileSync(files.photo.path);
            tempPhoto.photo.contentType = files.photo.type;
        }else if(!files.photo){
            return res.status(400).json({
                error: 'An Image is required'
            });
        }


        tempPhoto.save((err, data) => {
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

// exports.list = (req, res) => {
//     TempImage.find({}).exec((err, data) => {
//         if (err) {
//             return res.status(400).json({
//                 error: errorHandler(err)
//             });
//         }
//         res.json(data);
//     });
// };

exports.getTempPhoto = (req, res) => {
    TempImage.findOne({ name: "Developer" }).exec((err, photo) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo not found'
            });
        }else{
            res.json(photo)
        }
       
    });
};
