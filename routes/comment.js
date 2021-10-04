const express = require('express');
const router = express.Router();
const {
   postComment, 
   likeComment,
   unlikeComment,   
   getComments,
   editComment,
   deleteComment
  
} = require('../controllers/comment');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteBlog } = require('../controllers/auth');

router.put('/comment', requireSignin, authMiddleware, postComment);

router.put('/likeComment', requireSignin, authMiddleware, likeComment);
router.put('/unlikeComment', requireSignin, authMiddleware, unlikeComment);
router.put('/editComment', requireSignin, authMiddleware, editComment);
router.put('/deleteComment', requireSignin, authMiddleware, deleteComment);
router.get('/getComments/:slug', getComments)




module.exports = router;
