const path = require("path");
const express = require("express");
const parser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const uuid = require("uuid");

const User = require("./models/user");

const MONGODB_URI =
  "url here.....";

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({ 
  destination: (req, file, cb) => {
    console.log(file.fieldname);
    if (file.fieldname == "question") {
      cb(null, "uploads/questions");
    } else {
      cb(null, "uploads/responses");
    }
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v1() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");

app.set("view engine", "ejs");
app.set("views", "views");
app.use(parser.urlencoded({ extended: true }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    { name: "question", maxCount: 1 },
    { name: "response", maxCount: 1 },
  ])
);
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/questions",
  express.static(path.join(__dirname, "uploads/questions"))
);
app.use(
  "/responses",
  express.static(path.join(__dirname, "uploads/responses"))
);
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("Connected to Database.");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
