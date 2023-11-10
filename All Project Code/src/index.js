// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// from lab 11
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/', (req, res) => {
    res.redirect('/login'); 
  });
  

app.get('/register', (req, res) => {
    res.render('pages/register')
});

app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
    const query = 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)  RETURNING * ;';
    db.any(query, [
      req.body.username,
      hash,
      req.body.email
    ])
    .then(function (data) {
        res.render("pages/login", {message: `Account with username ${req.body.username} created!`});
      })
      // if query execution fails
      // send error message
      .catch(function (err) {
        console.log(err);
        return res.redirect("/register");
    });
});

app.get("/login", (req, res) => {
    res.render("pages/login");
});

app.post("/login", (req, res) => {
    console.log(req.body)
    const username = req.body.username;
    const password = req.body.password;
    const username_query = "SELECT * FROM users WHERE username = $1;";
    db.one(username_query, [username])
      .then( async(data) => {
        console.log(data)
        const user = {
            username: username,
        }
        const match = await bcrypt.compare(password, data.password);
        
            if(match)
            {
              req.session.user = user;
              req.session.save();
              res.redirect("/discover");
            }
            else 
            { 
              res.render('pages/login', {message: 'Incorrect password. Try again.'});
            }
      })
      .catch((err) => {
        console.log(err);
        res.render('pages/register', {message: 'No matching username. Must register account first.'});
      });
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

app.get('/discover', (req, res) => {
        // Make the API call using Axios
        axios({
          url: 'https://app.ticketmaster.com/discovery/v2/events.json',
          method: 'GET',
          dataType: 'json',
          headers: {
            'Accept-Encoding': 'application/json',
          },
          params: {
            apikey: process.env.API_KEY,
            keyword: 'rap', // Example keyword (you can change it)
            size: 10 // Example number of search results (you can change it)
          },
        })
        .then(results => {
          const data = results.data._embedded ? results.data._embedded.events : [];
          res.render('pages/discover', { results: data, message: `Logged in Successfully`,});
          console.log(data);
        })
        .catch(error => {
          console.error(error);
          res.render('pages/discover', { results: [], error: 'Failed to fetch data from Ticketmaster API' });
        });
      });

app.get("/logout", (req, res) => {
        req.session.destroy();
        res.render('pages/login', {message: `Logged out successfully`});
      });
    
// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');