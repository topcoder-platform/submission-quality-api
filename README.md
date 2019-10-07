# Topcoder SonarQube Scorer Webhook API

## Dependencies

- nodejs https://nodejs.org/en/ (v10)
- Docker for local deployment of API

## Setting up the pre-requisities

### Setting up Webhooks

1. Find out device level public IP address of your machine by executing `ifconfig` command (For Linux). `ipconfig` for windows

You will see some output like this
```
br-6280c84d0e2f Link encap:Ethernet  HWaddr 02:42:01:73:38:1b  
          inet addr:172.19.0.1  Bcast:172.19.255.255  Mask:255.255.0.0
```

Choose one of the IP Address in Ethernet name. In the above case it is 172.19.0.1

Webhook address to be used will be http://172.19,0.1:3000/scan/webhook

2. Navigate to http://localhost:9000/admin/settings?category=webhooks - `localhost:9000` here refers to your SonarQube UI. Update accordingly.

3. Add name to your webhook and enter the URL found in the 1st step and save.

4. Alternatively, use [ngrok](https://ngrok.com/) and set it up to listen to port 3000 (the default one)

## Configuration

Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level
- PORT: the server port
- API_VERSION: The API version
- SUBMISSION_API_URL: Submission API URL

- SONARQUBE_HOST: SonarQube host. Default: http://localhost:9000
- SONARQUBE_TOKEN: SonarQube access token. Optional parameter, must be set when ACL is configured for the project.
More details about access tokens - https://docs.sonarqube.org/latest/user-guide/user-token/

- All variables starting with prefix `AUTH0` corresponds to Auth0 related credentials

## Local deployment

1. From the project root directory, run the following command to install the dependencies

```bash
npm i
```

2. To run linters if required

```bash
npm run lint

npm run lint:fix # To fix possible lint errors
```

3. Ensure that environment variables are set as required

4. Start the processor and express server

```bash
npm start
```

## Verification

1. To verify that review has been created properly, Assuming you are using Topcoder Dev Submission API as `SUBMISSION_API_URL`, Login to https://lauscher.topcoder-dev.com/ with `TonyJ:appirio123`. Check the data posted in topic `submission.notification.create`

2. You will be able to see the review payload

## Running unit tests

To run unit tests

```
npm run test
```

## Code coverage

```
npm run coverage
```

## Local Deployment with Docker

To run the Submission quality processor using docker, follow the below steps

1. Navigate to the directory `docker`

2. Rename the file `sample.api.env` to `api.env`

3. Set the required Auth0, Submission API URL and SonarQube config in the file `api.env`

4. Once that is done, run the following command

```bash
docker-compose up
```

5. When you are running the application for the first time, It will take some time initially to download the image and install the dependencies

**Note:**

3 security vulnerabilities reported during npm install is from the existing Topcoder package `tc-core-library-js` which is necessary to generate M2M tokens.

https://github.com/appirio-tech/tc-core-library-js/blob/master/package.json
