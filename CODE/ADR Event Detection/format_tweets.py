#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Sat Nov 18 20:34:44 2017

@author: vikrambahl
"""

import csv
from datetime import datetime

drugs_file = open("all_drug_tweets.csv","r")
reader = csv.reader(drugs_file,delimiter = ',')

csvFile = open("cleaned", "w")
csvWriter = csv.writer(csvFile)

csvWriter.writerow(["id","start","end","semantic_type","span","reldrug","tgtdrug","text"])

count = 1

for row in reader:
    csvWriter.writerow([count,0,0,"ADR",0,row[0],row[0],str(str(row[0])+' '+str(row[1].split(' ')[0])+' '+ (' '.join(row[2].split())))])
   
    count = count+1

csvFile.close()