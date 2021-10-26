const express = require('express');
const router = express.Router();

// controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { createWriterPick, selectedWriter, deselectWriterPick, createWriterPopular, listPopularWriters, createEditorsPicks, deselectEditorsPicks, listEditorsPicks } = require('../controllers/selectQuery');

// validators
const { runValidation } = require('../validators');
const { createWriterPickValidator } = require('../validators/select');

// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/select-writer/:selectedWriter', runValidation, requireSignin, adminMiddleware, createWriterPick);
router.get('/selected-writer', selectedWriter);
router.delete('/deselect-writer/:selectedWriter', runValidation, requireSignin, adminMiddleware, deselectWriterPick);


// 
router.post('/popular-writers/:username', runValidation, requireSignin, adminMiddleware, createWriterPopular);
router.get('/popular-writers', listPopularWriters);


//
router.post('/editors-picks/:slug', requireSignin, adminMiddleware, createEditorsPicks);
router.get('/editors-picks', listEditorsPicks);
router.delete('/deselect-editors-picks/:slug', requireSignin, adminMiddleware, deselectEditorsPicks);


module.exports = router; 
