## Bidirectional LSTM for Labeling Adverse Drug Reactions in Twitter Posts

This repository contains code and data used in the paper:

Anne Cocos, Alexander G. Fiks, and Aaron J. Masino. Deep Learning for Pharmacovigilance: Recurrent Neural Network Architectures for Labeling Adverse Drug Reactions in Twitter Posts. (Under Review)

Please cite the following if you use these resources in your own work:

{citation}

----

### Quick Start


#### Contents
2. Files & Directories
3. Data
4. Code 

#### Files & Directories

Content | Description 
--- | --- 
`download_orig_datasets.sh` | Script to download ASU Twitter ADR Dataset and Word2Vec Twitter Model from original dataset authors.
`download_tweets.sh` | Script to download the original Tweet text corresponding to Tweet IDs published in the ADR Twitter Dataset v1.0 and CHOP ADHD ADR Dataset Supplement. Will create a new directory `data/seq_labeling/` to hold the downloaded tweet data.
`prep_train_test.sh` | Example script to get you started with training and testing the model.
`data/chop_adhd_adr_supp/` | Contains the annotated CHOP ADHD ADR Supplement data, and a list of the Twitter search terms used to gather the raw data.
`data/asu_tweets/` | Directory where you will download and unpack the ASU Twitter ADR Dataset v1.0 ([Nikfarjam et al. 2015](http://diego.asu.edu/Publications/ADRMine.html)) using script `download_orig_datasets.sh`.
`adr_label.py` | Main workhorse for training, validating, and testing the BLSTM RNN model
`approximateMatch.py` | Scoring script, also used in model validation. Written as a Keras Callback so that it can be called by Keras following every training epoch.
`download_tweets.py` | Downloads Tweet text given a list of Tweet IDs (called by `download_tweets.sh`).
`prep.py` | Script to prepare the data as downloaded (in tab-separated value format) for input to the model (pickled format)
`settings.py` | Lists default directory locations.
`utils/` | Helper packages for normalization and preprocessing 
`word2vec_twitter_model/` | Directory where you will download and unzip code and data for pre-trained Twitter word embeddings from [Godin et al. (2015)](http://noisy-text.github.io/2015/pdf/WNUT22.pdf) using script `download_orig_datasets.sh`.
`model_output/` | Directory will be populated with model data and predictions during train/test.

#### Data

With this model we are releasing the CHOP ADHD ADR Twitter Supplement, which we used to supplement the ASU Twitter ADR Dataset v1.0 for training data. See the included `ReadMe.txt` for details. As included, the data is divided into Twitter ID and annotation files, and you must run `download_tweets.py` to get the original Tweet text. Running that script will produce train and test data as tab-separated-value files in the directory `./data/seq_labeling/raw` with the headings (`id`,`start`,`end`,`semantic_type`,`span`,`reldrug`,`tgtdrug`,`text`). The fields `start` and `end` denote the indices of the first and last word in the tweet that make up the annotated span (where words are separated by spaces). The `semantic_type` denotes whether the span is an ADR, Indication, Beneficial reaction, or none of these (Negative). The `span` gives the span text, the `reldrug` is the name of the drug related to the span, the `tgtdrug` is the drug which was searched for to obtain the tweet, and `text` gives the tweet text.

In general, you can input any sequence labeling to this model that follows the same format. If you need to update the `semantic_type` headings, you can do so in `settings.py`.

Before running the model, you should run `prep.py` in order to build the feature indices and pickle your data for input to the model.



