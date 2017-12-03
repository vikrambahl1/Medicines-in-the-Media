#!/usr/bin/env bash

DATASETFILE=mypickle.pkl
PROCESSDATADIR=./data/seq_labeling/processed
BASEDIR=./model_output

# Prep the dataset, creating a 90/10 train/valid split from the original training data
python ./prep.py -o $DATASETFILE -v 0.1

# Train, validate, and test model with default settings (single 256-dimensional LSTM layer 
#   in each direction, pre-trained word embeddings held fixed through training)
WORKING_DIR=$BASEDIR/mytest
mkdir $WORKING_DIR
python ./adr_label1.py -P $PROCESSDATADIR/$DATASETFILE -b $WORKING_DIR > $WORKING_DIR/log
