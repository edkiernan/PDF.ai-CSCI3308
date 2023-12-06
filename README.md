# PDF.ai
Group 03 Project for CSCI3308

## Description
PDF.ai is a pdf summarizing and explanation application in which users can upload a PDF to be summarized by Google's VertexAI. 
## Contributors
* Eddie Kiernan
* Amber Perillo
* Wei Jiang
* Estelle Girard 
* Helen Garabedian 
* Justice Asamonye
## Technology Stack
* Node.js
* Express.js
* Google Cloud Storage
* VertexAI
* Bootstrap
* EJS
* CSS
* HTML 
* PostgreSQL
## Prerequisites to run the application
In order to run the application the following files/folder must be added to directory `PDF.ai-CSCI3308/All Project Code` of the repository.
1. .env
The .env file will look similar to this but with your own google VertexAI credentials and google cloud database.
```YAML /.env
# database credentials
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="pwd"
POSTGRES_DB="users_db"

# Node vars
SESSION_SECRET="super duper secret!"
GOOGLE_APPLICATION_CREDENTIALS="./credentials/(yourgooglecreds.json)"
GCLOUD_STORAGE_BUCKET="your-google-cloud-database"
```
2. /src/credentials/name_of_googleinfo.json
Your file in the credentials file will look similiar to this:
```json
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": "",
  "universe_domain": ""
}
```
## Instructions on how to run the application locally.
Running the application locally can be done using docker. First ensure you have docker correctly installed. Once it is ensured docker is installed we can run the apllication locally. Ensure you are in directory `PDF.ai-CSCI3308/All Project Code` and run the terminal command:
```
docker-compose up
```
Allow for the application to get up and running (should take no longer than ~30 seconds). Once application is up and the database is connected you can visit the running application at the link: http://localhost:3000/ \ 
Once you are ready to shut down the application use `docker compose down` to shut down docker or `docker compose down -v` to shut down the containors.

## How to run the tests
The automated tests are ran locally and are held in the in the server.spec.js file. 
To run the tests you must first have docker installed. Once it is ensured docker is installed go to the docker-compose.yaml file in `PDF.ai-CSCI3308//All Project Code/src`. Under the part of the file that says "web" change the code from: 
```
command: "npm start" 
```
to 
```
command: "npm run testandrun"
```
Now upon starting up docker with the terminal command `docker compose up` docker will start up and the automated test cases will run. 
>NOTE: Upon shutting down docker ensure the command `docker compose down -v` is used. If this command is not used before starting docker back up and runnig the tests an error will be thrown in regards to a duplicate primary key.
## Link to the deployed application
http://recitation-14-team-03.eastus.cloudapp.azure.com:3000/