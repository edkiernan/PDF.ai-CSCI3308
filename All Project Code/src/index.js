// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************
const express = require('express'); // To build an application server or API
const app = express()
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config(); // To read the .env file
const storage = new Storage();
const bucketName = process.env.GCLOUD_STORAGE_BUCKET;

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

const users = {
    username: undefined,
    password: undefined,
    email: undefined,
};

// ****************************************************
// <!-- Section 2 : Enpoint Implementation-->
// ****************************************************

// from lab 11
app.get('/welcome', (req, res) => {
    res.json({ status: 'success', message: 'Welcome!' });
});

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

app.post('/upload-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
          res.status(400).send('No file uploaded.');
          return;
        }
    
        const pdfFile = file.path;
        const destination = 'pdf_uploads/' + file.originalname; // Define the destination path in the bucket
    
        // Upload the PDF file to Google Cloud Storage
        await storage.bucket(bucketName).upload(pdfFile, {
          destination: destination,
          metadata: {
            contentType: 'application/pdf' // Set the content type of the file
          },
        });
    
        // File has been uploaded to Google Cloud Storage, now delete the local file
        fs.unlink(pdfFile, (err) => {
          if (err) {
            console.error('Error deleting local file:', err);
            // Depending on your application needs, you may or may not want to send an error response here
          } else {
            console.log('Successfully deleted local file');
          }
        });
    
        res.status(200).send('File uploaded and stored successfully!');
      } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('An error occurred while uploading the file.');
      }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render('pages/login', { message: `Logged out successfully` });
});

// *****************************************************
// <!-- Section 3 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');