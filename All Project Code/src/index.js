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
const upload = multer({ dest: 'uploads/' });


const { createMessage, fetchChatCompletion } = require('./utilities/message.js');
const { uploadPDF, downloadPDF, listUserFiles } = require('./utilities/storageHandler.js');
const { getTextFromPage, getMaxNumPages } = require('./utilities/pdfUtil.js');

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
app.use(bodyParser.urlencoded({ extended: true }));
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

app.use(express.static(__dirname + '/public'));

// const user = {
//     username: undefined,
//     password: undefined,
//     email: undefined,
// };

// ****************************************************
// <!-- Section 2 : Enpoint Implementation-->
// ****************************************************


// from lab 11, simply api to test server start up
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

        const { password, email } = req.body;


        // const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
        const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);

        // if (!user) {
        //     return res.redirect('/register');
        // }

        if (!user) {
            throw new Error("Email not found.");
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // Send a success message
            // res.render('pages/login', { message: 'Logged in successfully!', error: false });
            req.session.user = user;
            req.session.save();
            res.redirect("/history");
        }
        else {
            throw new Error('Incorrect password. Try again');
        }



        // You may also redirect to '/home' if needed
        // res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.render('pages/login', { message: error.message, error: true });
    }
});


//Get for register
app.get('/register', (req, res) => {
    res.render('pages/register')
});

// Post for register
app.post('/register', async (req, res) => {
    try {
        if (!req.body.password || !req.body.username || !req.body.email) {
            throw new Error('Please fill in all fields.');
        }

        const hash = await bcrypt.hashSync(req.body.password, 10);

        const query = `
        INSERT INTO users (username, password, email)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
        const result = await db.one(query, [req.body.username, hash, req.body.email]);
        console.log(result);

        // Send a success message
        res.render('pages/register', { message: 'Registered successfully! Please log in.', error: false });

        // You may also redirect to '/login' if needed
        // res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('pages/register', { message: error.message, error: true });
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

// debugging

// app.get('/debug-app', (req, res) => {
//     res.render('pages/app', { user: { username: 'test_user' } });
// });

// app.post('/debug-upload-pdf', upload.single('pdfFile'), async (req, res) => {
//     try {
//         await uploadPDF(req.file, "test_user");
//         res.status(200).json({ message: 'File uploaded and stored successfully!', fileName: req.file.originalname });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'An error occurred while uploading the file.' });
//     }
// });

// app.get('/debug-get-pdf/:fileName', async (req, res) => {
//     try {
//         const [content] = await downloadPDF(req.params.fileName, "test_user");
//         req.session.pdfBuffer = content;
//         res.contentType('application/pdf');
//         res.end(content, 'binary');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('An error occurred while retrieving the file.');
//     }
// });

// app.get('/debug-get-page-content/:fileName/:pageNumber', async (req, res) => {
//     try {
//         const content = await getTextFromPage(req.params.fileName, "test_user", req.params.pageNumber);
//         res.status(200).json({ content });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('An error occurred while retrieving the file.');
//     }
// });

// app.get('/debug-get-page-summary', async (req, res) => {
//     // if (!req.session.pdfBuffer) {
//     //     return res.status(400).json({ message: 'No PDF file has been uploaded yet.' });
//     // }
//     console.log("called")
//     try {
//         const pageNumber = req.query.pageNumber;
//         let [pdfBuffer] = await downloadPDF("Text.pdf", "test_user");
//         const pageText = await getTextFromPage(pdfBuffer, pageNumber);

//         // Prepare AIChatHistory based on the received context and page text
//         let AIChatHistory = [
//             {
//                 author: 'user',
//                 content: `Summarize ${pageText}`, // You can modify this as needed
//             },
//         ];

//         // Generate the summary using the provided function or model
//         let summary = await fetchChatCompletion(AIChatHistory, true);

//         let message = createMessage({isBot: true, textContent: summary});
//         // Return the generated summary
//         res.status(200).json({ summary, HTML: message });
//     } catch (error) {
//         console.error('Error generating summary:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

app.get('/debug-get-user-files', async (req, res) => {
    try {
        const files = await listUserFiles("test_user");
        res.status(200).json({ files });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while retrieving the file.');
    }
});

// Authentication Required
app.use(auth); // Uncomment outside of testing

// app.get('/app', auth, (req, res) => {
//     res.render('pages/app', { username: req.session.user.username, pageNumber: 1 });
// });

app.get('/app', auth, async (req, res) => { // debugging
    // let fileName = "Text.pdf";
    // if there's no file name in the session, then redirect to /history page
    if (!req.session.fileName) {
        return res.redirect('/history');
    }
    res.render('pages/app', { username: req.session.user.username, pageNumber: 1, fileName: req.session.fileName });
});

app.get('/app/:fileName', auth, async (req, res) => {
    res.render('pages/app', { username: req.session.user.username, pageNumber: 1, fileName: req.params.fileName });
});

app.get('/history', auth, async (req, res) => {
    let userFiles = await listUserFiles(req.session.user.username);

    // if there's a message in the query, then render history with the message
    if (req.query.message) {
        res.render('pages/history', { username: req.session.user.username, userFiles, message: req.query.message, error: req.query.error });
        return;
    }

    res.render('pages/history', { username: req.session.user.username, userFiles });
});

app.post('/upload-pdf', upload.single('pdfFile'), async (req, res) => {
    // if no file is uploaded, then render history with an error message
    if (!req.file) {
        let userFiles = await listUserFiles(req.session.user.username);
        return res.redirect('/history?message=Please upload a PDF file&error=true');
    }
    try {
        await uploadPDF(req.file, req.session.user.username);
        // res.status(200).json({ message: 'File uploaded and stored successfully!', fileName: req.file.originalname });
        req.session.fileName = req.file.originalname;
        res.redirect('/app');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while uploading the file.' });
    }
});

app.get('/get-pdf/:fileName', async (req, res) => {
    try {
        const content = await downloadPDF(req.params.fileName, req.session.user.username);
        req.session.pdfBuffer = content[0].toString('base64');
        req.session.pageNumber = 1;
        req.session.fileName = req.params.fileName;
        req.session.save();
        res.contentType('application/pdf');
        // res.end(content, 'binary');
        res.send(content[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while retrieving the file.');
    }
});




app.get('/get-page-summary', async (req, res) => {
    if (!req.session.pdfBuffer) {
        return res.status(400).json({ message: 'No PDF file has been uploaded yet.' });
    }
    // console.log("called")
    try {
        // let [pdfBuffer] = await downloadPDF(req.session.fileName, req.session.user.username);
        let pdfBuffer = Buffer.from(req.session.pdfBuffer, 'base64');
        const pageText = await getTextFromPage(pdfBuffer, req.session.pageNumber);

        // console.log(pageText.length)
        // Prepare AIChatHistory based on the received context and page text
        let AIChatHistory = [
            {
                author: 'user',
                content: `Summarize ${pageText}`, // You can modify this as needed
            },
        ];

        // Generate the summary using the provided function or model
        let summary = await fetchChatCompletion(AIChatHistory, true);

        // let summary = "debugging summary"

        let message = createMessage({isBot: true, textContent: summary});
        // Return the generated summary
        res.status(200).json({ response: summary, HTML: message });
    } catch (error) {
        console.error('Error generating summary:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/get-chat-completion', async (req, res) => {
    try {

        // {
        //     "AIChatHistory" : [
        //         {
        //             role: 'user',
        //             content: "From previous context: answer prompt", 
        //         },
        //         {
        //             role: 'bot',
        //             content: "bot response", 
        //         },
        //     ],
        //     "context": true,
        //     "prompt": "answer {prompt}"
        // }

        const { AIChatHistory, context, prompt } = req.body;

        let pdfBuffer = Buffer.from(req.session.pdfBuffer, 'base64');

        const pageText = await getTextFromPage(pdfBuffer, req.session.pageNumber);
        
        // debug
        // const [pdfBuffer] = await downloadPDF("Text.pdf", "test_user");
        // const pageText = await getTextFromPage(pdfBuffer, 474);

        // console.log(`Before: `)
        // console.log(AIChatHistory)
        if (context) {
            AIChatHistory.push({
                author: 'user',
                content: `From ${pageText}: ${prompt}`, // You can modify this as needed
            });
        } else {
            AIChatHistory.push({
                author: 'user',
                content: prompt, // You can modify this as needed
            });
        }
        // console.log(`After: `)
        // console.log(AIChatHistory)

        // Debug
        // let AIChatHistory = [
        //     {
        //         role: 'user',
        //         content: `From ${context}: ${prompt}`, // You can modify this as needed
        //     },
        // ];
        // Generate the summary using the provided function or model
        // console.log(AIChatHistory)
        let response = await fetchChatCompletion(AIChatHistory, false);

        AIChatHistory.push({
            author: 'bot',
            content: response,
            citationMetadata: {
                citations: []
            }
        });

        // Return the generated summary
        res.status(200).json({ response, HTML: createMessage({ isBot: true, textContent: response }), AIChatHistory });
    } catch (error) {
        console.error('Error generating summary:', error);
        return res.status(500).json({ response: 'Internal Server Error' });
    }

});

// API route to get the maximum number of pages from a PDF
app.get('/getMaxPages', async (req, res) => {
    try {
        // Here, you would receive the PDF buffer and page number from the request query or body
        const { pdfBuffer, pageNumber } = req.query; // Assuming parameters are sent via query

        // Call the getMaxNumPages function passing the received PDF buffer and page number
        const maxPages = await getMaxNumPages(pdfBuffer, pageNumber);

        // Send the response with the maximum number of pages
        res.status(200).json({ maxPages });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

app.put('/update-page-number', async (req, res) => {
    try {
        const { pageNumber } = req.body;
        req.session.pageNumber = pageNumber;
        res.status(200).json({ message: 'Page number updated successfully!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render('pages/login', { message: `Logged out successfully` });
});

app.get('/settings', (req, res) => {
    res.render('pages/settings', { username: req.session.user.username, email: req.session.user.email });
});

app.get('/howTo', (req, res) => {
    res.render('pages/howTo', { username: req.session.user.username })
});

// *****************************************************
// <!-- Section 3 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');