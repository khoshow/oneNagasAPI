const express = require('express');
const router = express.Router();

// controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove, photo, update } = require('../controllers/tag');

// validators
const { runValidation } = require('../validators');
const { createTagValidator } = require('../validators/tag');

// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/tag', runValidation, requireSignin, adminMiddleware, create);
router.get('/tags', list);
router.get('/tag/:slug', read);
router.delete('/tag/:slug', requireSignin, adminMiddleware, remove);
router.get('/tag-image/image/:slug', photo);
router.put('/tag/update/:slug',runValidation, requireSignin, adminMiddleware, update);

module.exports = router; 
