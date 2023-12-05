# PDF.ai
Group 03 Project for CSCI3308

## Description
PDF.ai is a pdf summarizing application in which users can upload a PDF to be summarized by an AI service. 
## Contributors
* Eddie Kiernan
* Amber Perillo
* Wei Jiang
* Estelle Girard 
* Helen Garabedian 
* Justice Asamonye
## Technology Stack
(TBD)
## Prerequisites to run the application
(TBD)
## Instructions on how to run the application locally.
(TBD)
## How to run the tests
The automated tests are ran locally and are held in the in the server.spec.js file. 
To run the tests you must first have docker installed. Once it is ensured docker is installed go to the docker-compose.yaml file in All Project Code/src.Under the part of the file that says "web" change  
```
command: "npm start" 
```
to 
```
command: "npm run testandrun"
```
Now upon starting up docker with the terminal command `docker compose up` docker will start up and the automated test cases will run. 
**NOTE: Upon shutting down docker ensure the command `docker compose down -v` is used. If this command is not used before starting docker back up and runnig the tests an error will be thrown in regards to a duplicate primary key.**
## Link to the deployed application
http://recitation-14-team-03.eastus.cloudapp.azure.com:3000/