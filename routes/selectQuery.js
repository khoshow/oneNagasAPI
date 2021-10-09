const express = require('express');
const router = express.Router();

// controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { createWriterPick, selectedWriter, createWriterPopular, listPopularWriters, createEditorsPicks, listEditorsPicks } = require('../controllers/selectQuery');

// validators
const { runValidation } = require('../validators');
const { createWriterPickValidator } = require('../validators/select');

// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/select-writer/:selectedWriter', runValidation, requireSignin, adminMiddleware, createWriterPick);
router.get('/selected-writer', selectedWriter);


// 
router.post('/popular-writers/:username', runValidation, requireSignin, adminMiddleware, createWriterPopular);
router.get('/popular-writers', listPopularWriters);


//
router.post('/editors-picks/:slug', requireSignin, adminMiddleware, createEditorsPicks);
router.get('/editors-picks', listEditorsPicks);

module.exports = router; 
