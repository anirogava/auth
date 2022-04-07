const { hashSync } = require("bcrypt");
const express = require("express");
const app = express();
const UserModel = require("./models/user");
const session = require("express-session");
const connect = require("connect");
const passport = require("passport");
const { Sequelize, SequelizeStore } = require("sequelize");

const myStore = new SequelizeStore({
  db: Sequelize,
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: myStore,
    secret: "secret",
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res) => {
  res.render("Login");
});
app.get("/register", (req, res) => {
  res.render("Register");
});
app.post(
  "/login",
  passport.authenticate("local", { successRedirect: "protected" })
);
app.post("/register", (req, res) => {
  let user = new UserModel({
    username: req.body.username,
    password: hashSync(req.body.password, 10),
  });
  user.save().then((user) => console.log(user));
  res.send({ success: true });
});
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("./login");
});
app.get("/protected", (req, res) => {
  if (req.isAuthenticated()) {
    res.send("protected");
  } else {
    res.status(401).send({ msg: "Unauthorized" });
  }
});

app.listen(5000, (req, res) => {
  console.log("Listening on port 5000");
});
