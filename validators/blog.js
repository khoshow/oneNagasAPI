const { check } = require('express-validator');

exports.blogCreateValidator = [
    check('title')
        .not()
        .isEmpty()
        .withMessage('Title of the blog is required'),
    check('body')
        .not()
        .isEmpty()
        .withMessage('Body of the blogis required')
];
