const express = require('express');
const router = express.Router();
const { signup, signin, signout, requireSignin, adminMiddleware, forgotPassword, resetPassword, preSignup, googleLogin} = require('../controllers/auth');
const {tempPhoto, getTempPhoto} = require("../controllers/temporaryProfile")
const {forgotPasswordValidator, resetPasswordValidator} = require("../validators/auth")
// validators
const { runValidation } = require('../validators');
const { userSignupValidator, userSigninValidator } = require('../validators/auth');

router.post('/pre-signup', userSignupValidator, runValidation, preSignup);
router.post('/signup', signup);
router.post('/signin', userSigninValidator, runValidation, signin);
router.get('/signout', signout);
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);
router.post('/createTempProfilePhoto',requireSignin, adminMiddleware, tempPhoto);
router.get('/getTempProfilePhoto', getTempPhoto);


//Google Login
router.post('/google-login', googleLogin)

// test
// router.get('/secret', requireSignin, (req, res) => {
//     res.json({
//         user: req.user
//     });
// });

module.exports = router;
