// Imports the index.js file to be tested.
const server = require('../index.js'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// quick test to ensure chai working and index.js/server.spec.js interacting correctly
describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });

  // ===========================================================================
  // Lab 11
  
  // Part A Login 
  // Positive Test Case for /login
  it('Positive: /login - Successful Login', done => {
    chai
      .request(server)
      .post('/login')
      .send({ email: 'ekthree@gmail.com', password: 'password123' })
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming a successful login returns a 200 status
        expect(res).to.redirect; // Expecting a redirect to /app
        done();
      });
  });

  // Negative Test Case for /login
  it('Negative: /login - Invalid Credentials', done => {
    chai
    .request(server)
    .post('/login')
    .send({ email: 'ekthree@gmail.com', password: 'wrongpassword' }) // Use an incorrect password
    .end((err, res) => {
      expect(res).to.have.status(200); // Assuming the endpoint returns a 200 status for failed login attempts
      expect(res.text).to.include('Incorrect password. Try again'); // Verify the error message
      done();
    });
  });

  // Part B Register 
  // We are checking POST /register API by passing the user info in the correct order. This test case should pass and return a status 200 along with a "Success" message.
  // Positive Test Case for /register
  it('Positive: /register - Successful Registration', done => {
    chai
      .request(server)
      .post('/register')
      .send({ username: 'newuser', password: 'newpassword', email: 'newuser@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming a successful registration returns a 200 status
        expect(res.text).to.include('Registered successfully! Please log in.'); // Verify the rendered message
        expect(res.text).to.not.include('Error:'); // Ensure no error message is included
        done();
      });
  });

  // Negative Test Case for /register
  it('Negative: /register - Invalid Input', done => {
    chai
      .request(server)
      .post('/register')
      .send({ username: 'testuser', email: 'test@example.com' }) // Incomplete data, missing password
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming the endpoint returns a 200 status for failed registration attempts
        expect(res.text).to.include('Please fill in all fields.'); // Verify the error message for incomplete data
        done();
      });
  });

  // Other automated tests required for final project 

  // /get-page-summary
  // Positive
  it('/get-page-summary - Positive Test', (done) => {
    const session = {
      pdfBuffer: 'Mocked PDF Buffer', 
      pageNumber: 1, 
    };

    chai
      .request(server)
      .get('/get-page-summary')
      .set('Cookie', `connect.sid=${'mockedSessionId'}`) 
      .send({ session: session })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // Negative
  it('/get-page-summary - Negative Test', (done) => {
    // Simulate a situation where there is no PDF buffer in the session
    // Set req.session.pdfBuffer to undefined or null
    const session = {
      pdfBuffer: undefined, // no page buffer
      pageNumber: 1, 
    };

    chai
      .request(server)
      .get('/get-page-summary')
      .send({ session: session })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // /getMaxPages
  // Positve
  it('/getMaxPages - Successful retrieval of maximum pages', (done) => {
    const mockPDFBuffer = 'Mock PDF Buffer'; // Replace with an actual PDF buffer or create a suitable mock
    const mockPageNumber = 1;
  
    chai
      .request(server)
      .get('/getMaxPages')
      .query({ pdfBuffer: mockPDFBuffer, pageNumber: mockPageNumber })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  // Negative
  it('Negative /getMaxPages - No PDF buffer provided', (done) => {
    // Simulate a situation where the PDF buffer is not provided in the request
    const mockPageNumber = 1;
  
    chai
      .request(server)
      .get('/getMaxPages')
      .query({ pageNumber: mockPageNumber }) // PDF buffer is not provided
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});