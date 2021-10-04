const express = require('express');
const router = express.Router();

// controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove, photo, update } = require('../controllers/tribe');

// validators
const { runValidation } = require('../validators');
const { createTribeValidator } = require('../validators/tribe');

// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/naga-tribe', runValidation, requireSignin, adminMiddleware, create);
router.get('/naga-tribes', list);
router.get('/naga-tribe/:slug', read);
router.delete('/naga-tribe/:slug', requireSignin, adminMiddleware, remove);
router.get('/naga-tribe-photo/photo/:slug', photo);
router.put('/naga-tribe/update/:slug',runValidation, requireSignin, adminMiddleware, update);


module.exports = router; 
