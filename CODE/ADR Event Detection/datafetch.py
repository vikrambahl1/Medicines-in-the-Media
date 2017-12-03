#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Sat Nov 18 19:26:44 2017

@author: vikrambahl
"""
import tweepy
import csv
import codecs

consumer_key = ""
consumer_secret = ""
access_key = ""
access_secret = ""


#Access tokens 
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_key, access_secret)
api = tweepy.API(auth, wait_on_rate_limit=True)
# Open/Create a file to append data


drugs_file = open('drugs.txt',"r")
reader = csv.reader(drugs_file,delimiter = ',')
csvFile = open('all_drug_tweets.csv', 'a')
csvWriter = csv.writer(csvFile)

for row in reader:
    for drug in row:
        
        for tweet in tweepy.Cursor(api.search, q=drug,lang="en").items(100):
            print str(tweet.text.encode("utf-8"))
            csvWriter.writerow([drug,tweet.created_at,str(tweet.text.encode("utf-8"))])
        



#Use csv Writer






drugs_file.close()
        