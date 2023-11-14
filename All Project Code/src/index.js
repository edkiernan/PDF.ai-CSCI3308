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

// Route to redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

//Get for login
app.get('/login', (req, res) => {
  res.render('pages/login');
});

// Post for login
app.post('/login', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', username);
    const address = await db.oneOrNone('SELECT * FROM users WHERE email = $3', email);

    if (!user) {
      return res.redirect('/register');
    }

    if (!address) {
      return res.redirect('/register');
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new Error('Incorrect password. Try again');
    }

    req.session.user = user;
    req.session.address = address;
    req.session.save();

    // Send a success message
    res.render('pages/login', { success: 'Logged in successfully!' });

    // You may also redirect to '/home' if needed
    // res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.render('pages/login', { error: 'An error occurred. Please try again.' });
  }
});


//Get for register
app.get('/register', (req, res) => {
  res.render('pages/register')
});

// Post for register
app.post('/register', async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const query = `
        INSERT INTO users (username, password, email)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const result = await db.one(query, [req.body.username, hash, req.body.email]);

    // Send a success message
    res.render('pages/register', { success: 'Registered successfully! Please log in.' });

    // You may also redirect to '/login' if needed
    // res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});


// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
app.use(auth);

app.get("/logout", (req, res) => {
      req.session.destroy();
      res.render('pages/login', {message: `Logged out successfully!`});
    });

// *****************************************************
// <!-- Section 3 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');