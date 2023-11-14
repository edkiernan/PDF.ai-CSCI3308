// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

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
  it('Negative : /login. Checking invalid username', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'ek3', password: 'password'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });

  it('Negative : /login. Checking invalid username', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'ek3', password: 22})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Invalid input');
        done();
      });
  });

  // Part B Register 
  //We are checking POST /register API by passing the user info in the correct order. This test case should pass and return a status 200 along with a "Success" message.
  //Positive cases
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'ek3', password: 'password', email: 'ekthree@gmail.com'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });

  //We are checking POST /register API by passing the user info in in incorrect manner (password cannot be an integer). This test case should pass and return a status 200 along with a "Invalid input" message.
  it('Negative : /register. Checking invalid username', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'ek3', password: 22, email: 'ekthree@gmail.com'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Invalid input');
        done();
      });
  });

});