const express = require('express');
const router = express.Router();
const {

    postReply,

    likeReply,
    unlikeReply,
    editReply,
    deleteReply,
    getReplies
} = require('../controllers/reply');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteBlog } = require('../controllers/auth');


router.put('/reply', requireSignin, authMiddleware, postReply);
router.put('/likeReply', requireSignin, authMiddleware, likeReply);
router.put('/unlikeReply', requireSignin, authMiddleware, unlikeReply);
router.put('/editReply', requireSignin, authMiddleware, editReply);
router.put('/deleteReply', requireSignin, authMiddleware, deleteReply);

router.get('/getReplies', getReplies)



module.exports = router;
