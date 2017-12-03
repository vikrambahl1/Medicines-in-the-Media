# team16final

## DESCRIPTION

Medicines in the Media is an interactive application to explore data relationships between
prescribing trends in the United States, FDA adverse events, news media and social media. All
data is eventually loaded in a Postgres DB which is read from a Flask API to a ReactJS web application.
Additionally, you will need to retrieve API keys for the NY Times and the Guardian. Media scraping
events are loaded into CSVs which are then loaded into Postgres. Twitter and ADR events are loaded
into MongoDB.

## INSTALLATION

### general
1. Get NY Times API key - https://developer.nytimes.com/
2. Get a Guardian API key - http://open-platform.theguardian.com/documentation/

### data

#### Postgres
Download and Postgres - https://www.postgresql.org/download/

#### Mongo
Download and install MongoDB - https://www.mongodb.com/download-center

#### Prescribing Data
TODO

#### FDA Adverse Event Data
TODO

#### Medication Vocabulary
TODO

#### FDA Approval Data
TODO

### api

#### Flask
TODO

#### Media Scraping
TODO

(This is then loaded into events table.)

#### Twitter ADR Detection
TODO

(This is then loaded into events table.)

### ui

#### Configuration
1. Verify your Medicines in the Media API is running or use the hosted api
2. Get your API keys and set them in CODE/ui/src/Detail.jsx
3. Install node - https://nodejs.org/en/download/
4. Install webpack globally - https://webpack.js.org/guides/installation/

#### Node
5. From CODE/ui, run `npm install`
6. From CODE/ui, compile *.jsx to bundle.js, run `npm run build`


## EXECUTION

### api

### ui
From CODE/ui, run `npm run serve`, the application will be running on port 9000
