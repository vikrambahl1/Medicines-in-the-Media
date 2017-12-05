# team16final

## DESCRIPTION

Medicines in the Media is an interactive application to explore data relationships between
prescribing trends in the United States, FDA adverse events, news media and social media. All
data is eventually loaded in a Postgres DB which is read from a Flask API to a ReactJS web application.
Additionally, you will need to retrieve API keys for the NY Times and the Guardian. Media scraping
events are loaded into CSVs which are then loaded into Postgres. Twitter and ADR events are loaded
into MongoDB.

Currently deployed at:
http://medicine.usnewsmap.com/

To view a specific drug name:
http://medicine.usnewsmap.com/?q=fluoxetine

## INSTALLATION

### general
1. Get NY Times API key - https://developer.nytimes.com/
2. Get a Guardian API key - http://open-platform.theguardian.com/documentation/
3. Make sure you have Python 2.7 installed - https://www.python.org/download/releases/2.7/
4. Install pip Python package manager - https://pip.pypa.io/en/stable/installing/

### data

#### Postgres
1. Download and install Postgres - https://www.postgresql.org/download/
2. Run CODE/data/database/ddl.sql

#### Mongo
Download and install MongoDB - https://www.mongodb.com/download-center

#### DataGrip (Optional)
For easy of use in importing and exploring data - https://www.jetbrains.com/datagrip/download/#section=mac

#### Medication Vocabulary
1. Download data files from https://athena.odysseusinc.com/search-terms/terms
2. Create an account
3. Download CSVs, use the default settings, make sure RxNorm, and NDC are checked.
4. Import into Postgres concept and drug tables

#### Prescribing Data
1. Download each CSV from 1992 to 2017 - https://data.medicaid.gov/browse?category=State+Drug+Utilization&limitTo=datasets
2. Import into `medicaid_data` in Postgres
3. Map drug concept names, using files in CODE/data/database (ndc_lookup.sql, ndc_map.sql, insert_ndc_lookup_modified.sql, update_medicaid_ndc_data.sql)

#### FDA Adverse Event Data
1. Download FAERS data in ASCII format - https://www.fda.gov/Drugs/GuidanceComplianceRegulatoryInformation/Surveillance/AdverseDrugEffects/ucm082193.htm
2. Import into `faers_demo`, `faers_drug`, `faers_outcome` in Postgres
3. Map drug concept names

#### FDA Approval Data
1. Import CODE/data/raw_data/FDA_products.txt into `fda_approvals`
2. Map into `events` table with event type `FDA_APPROVAL` in Postgres

### api

#### Flask
1. Install flask `pip install Flask` http://flask.pocoo.org/

#### Media Scraping
1. Run CODE/NewsScrape/NYT/getTimesArticles.py to gather all articles (up to 1000 in total) from the past 25 years on the top 125 drugs by prescription volume, sorted by relevance
2. Run CODE/NewsScrape/The_Guardian/getGuardianArticles.py to gather all articles (no limit) from the past 25 years on the top 125 drugs by prescription volume, sorted by relevance
3. Using a text editor, combine the two outputs into a single file.
4. Import int 'events' table with event type 'ARTICLE' in Postgres

#### Twitter ADR Detection

1.Setup the following python libraries in your system
- numpy==1.11.1
- scipy==0.18.1
- six==1.10.0
- gensim==0.12.4
- scikit-learn==0.16.1
- beautifulsoup4==4.3.2
- matplotlib==1.4.3
- Theano==0.7.0
- Keras==0.3.1
- h5py==2.6.0

2. Download the data from Twitter for all the drugs in the file "drugs.txt" by running the following commands:
- python datafetch.py  
- python format_tweets.py

3. Run the pre-trained model by running the following command:
./prep_train_test.sh

The output would be stored in the file model_output/mytest/predictions/run_adr_file

To upload the data to a mongodb database, use the command python upload_mongo.py by updating the values of your uri and database name. 


### ui

#### Configuration
1. Verify your Medicines in the Media API is running or use the hosted api
2. Get your API keys and set them in CODE/ui/src/Detail.jsx
3. Install node - https://nodejs.org/en/download/
4. Install webpack globally - https://webpack.js.org/guides/installation/
5. Update API url if pointing to a local API.

#### Node
5. From CODE/ui, run `npm install`
6. From CODE/ui, compile *.jsx to bundle.js, run `npm run build`


## EXECUTION

### api
From CODE/api, `FLASK_APP=api.py flask run`, the application will be running on port 5000

### ui
From CODE/ui, run `npm run serve`, the application will be running on port 9001 (or change port in package.json)

## REFERENCES
1. A Cocos, AG Fiks, and AJ Masino. “Deep learning for pharmacovigilance: recurrent neural network architectures for labeling adverse drug reactions in Twitter posts”. In:Journal  of  the  American  Medical  InformaticsAssociation24.4 (2017), pp. 813–821.doi:10.1093/jamia/ocw180
