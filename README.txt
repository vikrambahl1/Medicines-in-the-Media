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
1. Download and Postgres - https://www.postgresql.org/download/
2. Run CODE/data/database/ddl.sql

#### Mongo
Download and install MongoDB - https://www.mongodb.com/download-center

#### DataGrip (Optional)
For easy of use in importing and exploring data - https://www.jetbrains.com/datagrip/download/#section=mac

#### Medication Vocabulary
1. Download data files from https://athena.odysseusinc.com/search-terms/terms
2. Create an account, use the default settings, make sure RxNorm, and NDC are checked.
3. Download CSVs
4. Import into concept and drug tables

#### Prescribing Data
1. Download each CSV from 1992 to 2017 - https://data.medicaid.gov/browse?category=State+Drug+Utilization&limitTo=datasets
2. Import into `medicaid_data`
3. Map drug concept names, using files in CODE/data/database (ndc_lookup.sql, ndc_map.sql, insert_ndc_lookup_modified.sql, update_medicaid_ndc_data.sql)

#### FDA Adverse Event Data
1. Download FAERS data in ASCII format - https://www.fda.gov/Drugs/GuidanceComplianceRegulatoryInformation/Surveillance/AdverseDrugEffects/ucm082193.htm
2. Import into `faers_demo`, `faers_drug`, `faers_outcome`
3. Map drug concept names

#### FDA Approval Data
1. Import CODE/data/raw_data/FDA_products.txt into `fda_approvals`.
2. Map into `events` table with event type `FDA_APPROVAL`.

### api

#### Flask
TODO

#### Media Scraping
TODO

(This is then loaded into events table as event type `ARTICLE`.)

#### Twitter ADR Detection
TODO

(This is then loaded into events table as event type `ADR`.)

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
TODO

### ui
From CODE/ui, run `npm run serve`, the application will be running on port 9000
