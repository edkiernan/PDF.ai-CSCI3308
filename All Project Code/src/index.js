// *********************************
// <!-- Section 1 : Dependencies-->
// *********************************

const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");

// db config
const dbConfig = {
  host: "db",
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

// db test
db.connect()
  .then((obj) => {
    // Can check the server version here (pg-promise v10.1.0+):
    console.log("Database connection successful");
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.json());

// set session
app.use(
  session({
    secret: "XASDASDA",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const users = {
    username: undefined,
    password: undefined,
    email: undefined,
};

// ****************************************************
// <!-- Section 2 : Enpoint Implementation-->
// ****************************************************

// <!-- Endpoint 1 :  Get Default endpoint ("/") -->
app.get("/", (req, res) => {
    res.render("pages/home", {
      username: req.session.users.username,
      password: req.session.users.password,
      email: req.session.users.email,
    });
  });
