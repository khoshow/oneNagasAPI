const { check } = require('express-validator');

exports.createTribeValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required')
];
