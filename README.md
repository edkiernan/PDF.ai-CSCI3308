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
1. Create .env
* The .env file will look similar to this but with your own google VertexAI credentials and google cloud database.
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
2. Create Service Account and create /src/credentials/name_of_googleinfo.json file \
To get the JSON credentials for authenticating with the Google Cloud API, you need to create a service account and generate a key file in the Google Cloud Console. Here are the steps to do so:
    1. Go to the Google Cloud Console (https://console.cloud.google.com).
    2. Select or create a project where you want to access the Google Cloud Storage.
    3. Navigate to the "IAM & Admin" section, then select "Service accounts" from the sidebar.
    4. Click "Create Service Account" at the top of the page.
    5. Enter a name and description for the service account, and click "Create and Continue".
    6. Optionally assign roles to the service account based on the permissions it requires. For Google Cloud Storage, you might assign roles such as "Storage Object Admin" or "Storage Object Creator" for full or limited access respectively.
    7. Click "Done" to create the service account without granting users access to it (you can do this later if needed).
    8. After creating the service account, click on the email address of the service account in the list to go to its details page.
    9. In the "Keys" tab, click "Add Key" and choose "Create new key".
    10. Select "JSON" as the key type, and click "Create".
    11. A JSON key file will be created and downloaded to your computer. This file contains the service account's credentials that you'll use to authenticate your application.

> For referrence your file should look like below but with your information filled in the quotes.
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
Now that you have the JSON key file:

* Use the path to this file in the GOOGLE_APPLICATION_CREDENTIALS environment in the .env file (yourgooglecreds.json).
3. Create a Google Cloud Storage Bucket:
    1. Go to the Google Cloud Console: https://console.cloud.google.com/.
    2. Select your project or create a new one.
    3.  Open the "Storage" section from the left-hand menu.
    4. Click on "Create bucket".
    5. Enter a globally unique name for your bucket (it must be unique across all Google Cloud Storage).
    6. Select the location where you want to store your data.
    7. Choose the default storage class (such as Standard, Nearline, Coldline, etc.).
    8. Click "Create".
    9. Once you've created the bucket, the name you assigned to it should be used as the value for GCLOUD_STORAGE_BUCKET in your .env file (your-google-cloud-database).
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