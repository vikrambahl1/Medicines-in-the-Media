'''
Created on Nov 22, 2017

@author: chris_000
'''
import json
import requests
import sys, os
import time
import urllib2
import datetime
from datetime import date
from os.path import join, exists
from urllib2 import HTTPError
from operator import itemgetter

# helper function to get json into a form I can work with       
def convert(input):
    if isinstance(input, dict):
        return {convert(key): convert(value) for key, value in input.iteritems()}
    elif isinstance(input, list):
        return [convert(element) for element in input]
    elif isinstance(input, unicode):
        return input.encode('utf-8')
    else:
        return input
    
# helpful function for processing keywords, mostly    
def getMultiples(items, key):
    values_list = ""
    if len(items) > 0:
        num_keys = 0
        for item in items:
            if num_keys == 0:
                values_list = item[key]                
            else:
                values_list =  "; ".join([values_list,item[key]])
            num_keys += 1
    return values_list
    
# get the articles from the NYTimes Article API    
def getNYTArticles(start, end, query, api_key, order):
    # LOOP THROUGH THE 101 PAGES NYTIMES ALLOWS FOR THAT DATE
    startDate = start.strftime("%Y%m%d")
    endDate = end.strftime("%Y%m%d")
    
    for n in range(5): # 5 tries
        try:
            if order == "relevance":
                request_string = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + query + "&begin_date=" + startDate + "&end_date=" + endDate + "&page=" + str(0) + "&api-key=" + api_key
            else:
                request_string = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + query + "&sort=" + order + "&begin_date=" + startDate + "&end_date=" + endDate + "&page=" + str(0) + "&api-key=" + api_key
            response = urllib2.urlopen(request_string)
            content = response.read()
            if content:
                articles = convert(json.loads(content))
                # if there are articles here
                if len(articles["response"]["docs"]) >= 1:
                    return articles
                    
                # if no more articles, go to next date
                else:
                    return 0
            time.sleep(3) # wait so we don't overwhelm the API
        except HTTPError as e:
            if e.code == 403:
                print "Script hit a snag and got an HTTPError 403. Check your log file for more info."
                return -1
            if e.code == 429:
                print "Waiting. You've probably reached an API limit."
                time.sleep(30) # wait 30 seconds and try again
        except: 
            continue

     
def getGuardianArticles(start, end, query, order):
    API_ENDPOINT = 'http://content.guardianapis.com/search'

    my_params = {
        'from-date': "",
        'to-date': "",
        'show-fields': 'all',
        'page-size': 10,
        'api-key': "" #TO-DO: PLACE YOUR API KEY FOR THE GUARDIAN HERE
    }
    
    startdatestr = start.strftime('%Y-%m-%d')
    enddatestr = end.strftime('%Y-%m-%d')
    
    my_params['from-date'] = startdatestr
    my_params['to-date'] = enddatestr
    my_params['order-by'] = order
    current_page = 1
    my_params['page'] = current_page
    my_params['q'] = query
    resp = requests.get(API_ENDPOINT, my_params)
    data = convert(json.loads(resp.content))
    
    return data
    
def combineArticles(NYTArticles, GuardianArticles, order):
    #
    #  Output structure:
    #                   combined[0]    -- Publication Date
    #                   combined[1]    -- Headline
    #                   combined[2]    -- Source
    #                   combined[3]    -- Web URL
    #                   combined[4]    -- Section/News Desk
    #                   combined[5]    -- Text (Snippet for NYT, full body for Guardian 
    #
    #
    #
    combined = []
    if len(NYTArticles["response"]["docs"]) >= 1:  
        for article in NYTArticles["response"]["docs"]:
            # should probably pull these if/else checks into a module
            combined.append([
                article["pub_date"], 
                str(article["headline"]["main"]).decode("utf8").replace("\n","") if "main" in article["headline"].keys() else "", 
                str(article["source"]).decode("utf8") if "source" in article.keys() else "", 
                article["web_url"] if "web_url" in article.keys() else "",
                str(article["new_desk"]).decode("utf8") if "new_desk" in article.keys() else "",
                str(article["snippet"]).decode("utf8").replace("\n","") if "snippet" in article.keys() else "",
                ])
    
    if len(GuardianArticles["response"]["results"]) >= 1:  
        for article in GuardianArticles["response"]["results"]:
            # should probably pull these if/else checks into a module
            combined.append([
                article["webPublicationDate"], 
                str(article["fields"]["headline"]).decode("utf8").replace("\n","") if "headline" in article["fields"].keys() else "", 
                str(article["fields"]["publication"]).decode("utf8") if "publication" in article["fields"].keys() else "", 
                article["webUrl"] if "webUrl" in article.keys() else "",
                str(article["sectionName"]).decode("utf8") if "sectionName" in article.keys() else "",
                str(article["fields"]["bodyText"]).decode("utf8").replace("\n","") if "bodyText" in article["fields"].keys() else "",
                ])

    if order == "oldest":
        sorted(combined, key=itemgetter(1))
    else:
        sorted(combined, key=itemgetter(1), reverse=True)

    return combined
# Main function where stuff gets done

def main():
    
    query = sys.argv[1]
    order = sys.argv[2] #relevance, oldest, newest
    NYTkey = "" # TO-DO: PLACE YOUR NYT API KEY HERE
    
    
    start = datetime.date(1991, 1, 1)
    end = datetime.date.today()
    
    print "Getting started"
   
    NYTArticles = getNYTArticles(start, end, query, NYTkey, order)
    GuardianArticles = getGuardianArticles(start, end, query, order)
        
    combineArticles(NYTArticles, GuardianArticles,order)
    
    print "Finished!"

if __name__ == '__main__' :
    main()
