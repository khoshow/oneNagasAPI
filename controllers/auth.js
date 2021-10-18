const User = require("../models/user");
const TempImage = require("../models/tempPhoto");
const shortId = require("shortid");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const Blog = require("../models/blog");
const { errorHandler } = require("../helpers/dbErrorHandler");
const user = require("../models/user");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");

const sgMail = require("@sendgrid/mail"); // SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.preSignup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: "10m",
      }
    );
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Account activation link`,
      html: `
    <p>Please use the following link to activate your acccount:</p>
    <a href={${process.env.CLIENT_URL}/auth/account/activate/${token}}>${process.env.CLIENT_URL}/auth/account/activate/${token}</a>
    <hr />
    <p>This email may contain sensitive information<p>
    <p>https://nagamei.com</p>
    `,
    };

    sgMail
      .send(emailData)
      .then((sent) => {
        return res.json({
          message: `Activation link has been sent to ${email}. Please follow the instructions to activate your account.`,
        });
      })
      .catch((error) => {
        console.log("error", error);
      });
  });
};

// exports.signup = (req, res) => {
//     // console.log(req.body);
//     User.findOne({ email: req.body.email }).exec((err, user) => {
//         if (user) {
//             return res.status(400).json({
//                 error: 'Email is taken'
//             });
//         }

//         const { name, email, password, photo } = req.body;
//         let username = shortId.generate();
//         let profile = `${process.env.CLIENT_URL}/profile/${username}`;

//         let newUser = new User({ name, email, password, profile, username, photo });
//         newUser.save((err, success) => {
//             if (err) {
//                 return res.status(400).json({
//                     error: err
//                 });
//             }
//             // res.json({
//             //     user: success
//             // });
//             res.json({
//                 message: 'Signup success! Please signin.'
//             });
//         });
//     });
// };

exports.signup = (req, res) => {
  const token = req.body.token;
  if (token) {
    TempImage.findOne({ name: "Developer" }).exec((err, tempPhoto) => {
      if (err || !tempPhoto) {
        return res.status(400).json({
          error: "Profile Photo not found",
        });
      } else {
        jwt.verify(
          token,

          process.env.JWT_ACCOUNT_ACTIVATION,
          function (err, decoded) {
            if (err) {
              return res.status(401).json({
                error: "Expired Link. Signup Again",
              });
            }
            const { photo } = tempPhoto;
            console.log("BCK: " + photo);
            console.log("BCKTem: " + tempPhoto);
            const { name, email, password } = jwt.decode(token);
            let username = shortId.generate();
            // let photo = myProfilePhoto();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;
            const user = new User({
              name,
              email,
              password,
              profile,
              username,
              photo,
            });
            user.save((err, user) => {
              if (err) {
                return res.status(401).json({
                  error: errorHandler(err),
                });
              }
              return res.json({
                message: "Signup Success! Please sign in.",
              });
            });
          }
        );
      }
    });
  } else {
    return res.json({
      message: "Something went wrong. Please try again",
    });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  // check if user exist
  User.findOne({ email: email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup.",
      });
    }
    // authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password do not match.",
      });
    }
    // generate a token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, { expiresIn: "1d" });
    const { _id, username, name, email, role } = user;

    return res.json({
      token,
      user: { _id, username, name, email, role },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signout success",
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== 1) {
      return res.status(400).json({
        error: "Admin resource. Access denied",
      });
    }

    req.profile = user;
    next();
  });
};

exports.canUpdateDeleteBlog = (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  Blog.findOne({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    let authorizedUser =
      data.postedBy._id.toString() === req.profile._id.toString();

    if (!authorizedUser) {
      return res.status(400).json({
        error: "You are not authorized",
      });
    }
    next();
  });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        error: "User with that email does not exist",
      });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10m",
    });
    const emailData = {
      from: process.env.EMAIL_TO,
      to: email,
      subject: `Password rest Link`,
      html: `
                <p>Please use the following link to reset your password:</p>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensitive information</p>
                <p>https://nagamei.com</p>
          `,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.json({ error: errorHandler(err) });
      } else {
        sgMail
          .send(emailData)
          .then((sent) => {
            return res.json({
              message: `Email has been set to ${email}. Please follow the instructions to reset your password. Link expires in 10 min`,
            });
          })
          .catch((err) => {
            console.log(err);
            // console.log(error.response.body.errors[0].message)
          });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({
            error: "Expired Link. Please try again",
          });
        }
        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(401).json({
              error: "Something went wrong. Please try again",
            });
          }
          const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
          };
          user = _.extend(user, updatedFields);

          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            }
            res.json({
              message: `Great! Now you can login with your new password`,
            });
          });
        });
      }
    );
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = (req, res) => {
  const idToken = req.body.tokenId;

  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      console.log(response);
      const { email_verified, name, email, jti } = response.payload;

      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            console.log(user);
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "1d",
            });
            res.cookie("token", token, { expiresIn: "1d" });

            const { _id, email, name, role, username } = user;
            return res.json({
              token,
              user: { _id, email, name, role, username },
            });
          } else {
            TempImage.findOne({ name: "Developer" }).exec((err, tempPhoto) => {
              if (err || !tempPhoto) {
                return res.status(401).json({
                  error: "Profile Photo Not Found",
                });
              } else {
                let username = shortId.generate();
                let profile = `${process.env.CLIENT_URL}/profile/${username}`;
                let password = jti;
                const { photo } = tempPhoto;
                user = new User({
                  name,
                  email,
                  profile,
                  username,
                  photo,
                  password,
                });
                user.save((err, data) => {
                  if (err) {
                    return res.status(400).json({
                      error: errorHandler(err),
                    });
                  }

                  const token = jwt.sign(
                    { _id: data._id },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                  );
                  res.cookie("token", token, { expiresIn: "1d" });
                  const { _id, email, name, role, username } = user;
                  return res.json({
                    token,
                    user: { _id, email, name, role, username },
                  });
                });
              }
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google Login failed. Please try again",
        });
      }
    });
};
