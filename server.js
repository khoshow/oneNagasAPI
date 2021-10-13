const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
// bring routes
const blogRoutes = require("./routes/blog");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const tagRoutes = require("./routes/tag");
const formRoutes = require("./routes/form");
const trialRoutes = require("./routes/trial");
const tribeRoutes = require("./routes/nagaTribes");
const selectQuery = require("./routes/selectQuery");
const commentRoutes = require("./routes/comment");
const replyRoutes = require("./routes/replies");
// app
const app = express();

// middleware that modify the response body
var doesModifyBody = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://nagamei.com");
    res.header("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.end();
    // doesn't call next()
  };
  

  app.use(doesModifyBody);


app.use(express.static(__dirname + "/public"));

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://nagamei.com");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
 
  
//   next();
// });

// db
let productionOrDevelopment;
if (process.env.NODE_ENV == "production") {
  productionOrDevelopment = process.env.DATABASE_CLOUD;
} else if (process.env.NODE_ENV == "development") {
  productionOrDevelopment = process.env.DATABASE_LOCAL;
}

mongoose
  .connect(productionOrDevelopment)
  .then(() => console.log("DB Connected "))
  .catch((err) => {
    console.log(err);
  });

// mongoose
// .connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
// .then(() => console.log('DB connected'))
// .catch(err => {
//     console.log(err);
// });

// middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
// cors
if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}
// routes middleware
app.use("/api", blogRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", tagRoutes);
app.use("/api", tribeRoutes);
app.use("/api", formRoutes);
app.use("/api", trialRoutes);
app.use("/api", selectQuery);
app.use("/api", commentRoutes);
app.use("/api", replyRoutes);

// port
const port = process.env.PORT || 8020;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
