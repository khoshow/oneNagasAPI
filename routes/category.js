const express = require('express');
const router = express.Router();
const { create, list, read, remove, photo, update } = require('../controllers/category');

// validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');
const { requireSignin, adminMiddleware } = require('../controllers/auth');

router.post('/category', runValidation, requireSignin, adminMiddleware, create);
router.get('/categories', list);
router.get('/category/:slug', read);
router.delete('/category/:slug', requireSignin, adminMiddleware, remove);
router.get('/category-image/image/:slug', photo);
router.put('/category/update/:slug',runValidation, requireSignin, adminMiddleware, update);

module.exports = router;
