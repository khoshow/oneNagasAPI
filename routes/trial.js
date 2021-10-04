const express = require('express');
const router = express.Router();
const {
    
    listHello,
    recentBlogs
   
} = require('../controllers/sample');




router.get('/trial/myBlogs', listHello)
router.get('/trial/recentBlogs', recentBlogs);

module.exports = router;