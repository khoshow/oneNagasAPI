const { check } = require('express-validator');

exports.createWriterPickValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required')
];
