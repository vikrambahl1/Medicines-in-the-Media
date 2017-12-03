import csv
import pymongo

from dateutil.parser import parse

def is_date(string):
    try: 
        parse(string)
        return True
    except ValueError:
        return False

insert_records = []

with open('run3_adr_file','r') as tsv_file:
    for line in tsv_file:
        
        line_arr = line.strip().split('\t')
        if(len(line_arr)>3):
            if(is_date(line_arr[1])):
               
                total_len = len(line_arr)
                drug_record = {}
                drug_record['drug_name'] = line_arr[0]
                drug_record['date'] = line_arr[1]
                tweet_text = ""
                line_arr1 = line_arr[2].strip().split(',')
                
                for k in range(len(line_arr1)):
                    tweet_text = tweet_text+line_arr1[k]+" "
                    
                drug_record['tweet_text'] = tweet_text    
                
                adr_list = []
                
                for i in range(3,total_len):
                    adr_list.append(line_arr[i])
                    
                drug_record['list_adr'] = adr_list
                
                insert_records.append(drug_record)

new_list = []

for rec in insert_records:
    if rec not in new_list:
        new_list.append(rec)



uri = ""
client = pymongo.MongoClient(uri)
db = ""
collection = ""

collection.insert_many(new_list)