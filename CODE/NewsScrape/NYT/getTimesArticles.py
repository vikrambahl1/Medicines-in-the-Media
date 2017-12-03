import urllib2
import json
import datetime
import time
import sys, os
import logging
from urllib2 import HTTPError
from ConfigParser import SafeConfigParser


# helper function to iterate through dates
def daterange( start_date, end_date ):
    if start_date <= end_date:
        for n in range( ( end_date - start_date ).days + 1 ):
            yield start_date + datetime.timedelta( n )
    else:
        for n in range( ( start_date - end_date ).days + 1 ):
            yield start_date - datetime.timedelta( n )

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

# helpful function to figure out what to name individual JSON files        
def getJsonFileName(query, page, json_file_path):
    json_file_name = ".".join([query,str(page),'json'])
    json_file_name = "".join([json_file_path,json_file_name])
    return json_file_name

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
def getArticles(startDate, endDate, query, api_key, json_file_path):
    # LOOP THROUGH THE 101 PAGES NYTIMES ALLOWS FOR THAT DATE
    for page in range(101):
        for n in range(5): # 5 tries
            try:
                request_string = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + query + "&begin_date=" + startDate + "&end_date=" + endDate + "&page=" + str(page) + "&api-key=" + api_key
                response = urllib2.urlopen(request_string)
                content = response.read()
                if content:
                    articles = convert(json.loads(content))
                    # if there are articles here
                    if len(articles["response"]["docs"]) >= 1:
                        json_file_name = getJsonFileName(query, page, json_file_path)
                        json_file = open(json_file_name, 'w')
                        json_file.write(content)
                        json_file.close()
                    # if no more articles, go to next date
                    else:
                        return
                time.sleep(1) # wait so we don't overwhelm the API
            except HTTPError as e:
                logging.error("HTTPError on page %s on %s (err no. %s: %s) Here's the URL of the call: %s", page, query, e.code, e.reason, request_string)
                if e.code == 403:
                    print "Script hit a snag and got an HTTPError 403. Check your log file for more info."
                    return
                if e.code == 429:
                    print "Waiting. You've probably reached an API limit."
                    time.sleep(15) # wait 30 seconds and try again
            except: 
                logging.error("Error on %s page %s: %s", query, page, sys.exc_info()[0])
                continue

# parse the JSON files you stored into a tab-delimited file
def parseArticles(query, tsv_file_name, json_file_path):

    for file_number in range(101):
        # get the articles and put them into a dictionary
        try:
            file_name = getJsonFileName(query,file_number, json_file_path)
            if os.path.isfile(file_name):
                in_file = open(file_name, 'r')
                articles = convert(json.loads(in_file.read()))
                in_file.close()
            else:
                break
        except IOError as e:
            logging.error("IOError in %s page %s: %s %s", query, file_number, e.errno, e.strerror)
            continue
        
        # if there are articles in that document, parse them
        if len(articles["response"]["docs"]) >= 1:  

            # open the tsv for appending
            try:
                out_file = open(tsv_file_name, 'ab+')

            except IOError as e:
                logging.error("IOError: %s %s %s %s", query, file_number, e.errno, e.strerror)
                continue
        
            # loop through the articles putting what we need in a tsv   
            try:
                for article in articles["response"]["docs"]:
                    # if (article["source"] == "The New York Times" and article["document_type"] == "article"):
                    keywords = ""
                    keywords = getMultiples(article["keywords"],"value")
    
                    # should probably pull these if/else checks into a module
                    variables = [
                        query,
                        article["pub_date"], 
                        #keywords, 
                        str(article["headline"]["main"]).decode("utf8").replace("\n","") if "main" in article["headline"].keys() else "", 
                        str(article["source"]).decode("utf8") if "source" in article.keys() else "", 
                        str(article["document_type"]).decode("utf8") if "document_type" in article.keys() else "", 
                        article["web_url"] if "web_url" in article.keys() else "",
                        str(article["new_desk"]).decode("utf8") if "new_desk" in article.keys() else "",
                        #str(article["section_name"]).decode("utf8") if "section_name" in article.keys() else "",
                        str(article["snippet"]).decode("utf8").replace("\n","") if "snippet" in article.keys() else "",
                        #str(article["lead_paragraph"]).decode("utf8").replace("\n","") if "lead_paragraph" in article.keys() else "",
                        ]
                    line = "\t".join(variables)
                    out_file.write(line.encode("utf8")+"\n")
            except KeyError as e:
                logging.error("KeyError in %s page %s: %s %s", query, file_number, e.errno, e.strerror)
                continue
            except (KeyboardInterrupt, SystemExit):
                raise
            except: 
                logging.error("Error on %s page %s: %s", query, file_number, sys.exc_info()[0])
                continue
        
            out_file.close()
        else:
            break
        
# Main function where stuff gets done

def main():
    
    config = SafeConfigParser()
    script_dir = os.path.dirname(__file__)
    config_file = os.path.join(script_dir, 'config/settings.cfg')
    config.read(config_file)
    
    json_file_path = config.get('files','json_folder')
    tsv_file_name = config.get('files','tsv_file')
    log_file = config.get('files','logfile')
    
    api_key = config.get('nytimes','api_key')    
    start = datetime.date( year = int(config.get('nytimes','start_year')), month = int(config.get('nytimes','start_month')), day = int(config.get('nytimes','start_day')) )
    end = datetime.date( year = int(config.get('nytimes','end_year')), month = int(config.get('nytimes','end_month')), day = int(config.get('nytimes','end_day')) )
    #query = config.get('nytimes','query')
        
    logging.basicConfig(filename=log_file, level=logging.INFO)
    
    logging.info("Getting started.") 
    print "Getting started"
    
    queries = ["Acetaminophen",
                "Hydrochlorothiazide",
                "levothyroxine",
                "Simvastatin",
                "Lisinopril",
                "Lovastatin",
                "Oxygen",
                "Metformin",
                "Propranolol",
                "Hydrocodone",
                "Dipyridamole",
                "Diltiazem",
                "Furosemide",
                "Amitriptyline",
                "Glyburide",
                "Theophylline",
                "atorvastatin",
                "Omeprazole",
                "Metoprolol",
                "Atenolol",
                "Enalapril",
                "Aspirin",
                "Amlodipine",
                "Verapamil",
                "Warfarin",
                "Nifedipine",
                "Glipizide",
                "Codeine",
                "Pravastatin",
                "Guaifenesin",
                "Gemfibrozil",
                "Captopril",
                "Potassium+Chloride",
                "Amoxicillin",
                "Digoxin",
                "Ibuprofen",
                "Albuterol",
                "benazepril",
                "Triamterene",
                "Pseudoephedrine",
                "valsartan",
                "Spironolactone",
                "Caffeine",
                "Isosorbide+Dinitrate",
                "Chlorthalidone",
                "Ciprofloxacin",
                "Perphenazine",
                "Hydrocortisone",
                "lansoprazole",
                "Sulfasalazine",
                "Fluoxetine",
                "thyroid+USP",
                "Propoxyphene",
                "Bupropion",
                "gabapentin",
                "Fenofibrate",
                "carvedilol",
                "Terazosin",
                "Oxycodone",
                "olmesartan",
                "Doxepin",
                "Sertraline",
                "Estradiol",
                "Phenylephrine",
                "Naproxen",
                "Pilocarpine",
                "butalbital",
                "Trazodone",
                "Trimethoprim",
                "Citalopram",
                "Metronidazole",
                "heparin,+porcine",
                "Labetalol",
                "Allopurinol",
                "Simethicone",
                "Chlorpropamide",
                "venlafaxine",
                "Dextromethorphan",
                "Ranitidine",
                "Doxazosin",
                "Sulfamethoxazole",
                "Timolol",
                "Triamcinolone",
                "pregabalin",
                "Prednisone",
                "Cimetidine",
                "Dexamethasone",
                "Losartan",
                "Nitroglycerin",
                "Nortriptyline",
                "oxybutynin",
                "Tramadol",
                "Hydralazine",
                "Diphenhydramine",
                "Alprazolam",
                "Chlorpheniramine",
                "Prazosin",
                "Risperidone",
                "Hydroxyzine",
                "ezetimibe",
                "Ramipril",
                "Esomeprazole",
                "glimepiride",
                "Tolazamide",
                "pantoprazole",
                "Clonidine",
                "Levodopa",
                "Carbidopa",
                "Sodium+Chloride",
                "Finasteride",
                "Thioridazine",
                "Methyldopa",
                "Promethazine",
                "Bisoprolol",
                "Nadolol",
                "rosuvastatin",
                "quinapril",
                "rosiglitazone",
                "candesartan",
                "Fosinopril",
                "Diclofenac",
                "Morphine",
                "Imipramine",
                "Sotalol",
                "Haloperidol"]
    try:
        # LOOP THROUGH THE SPECIFIED DATES
        #for date in daterange( start, end ):
        #    date = date.strftime("%Y%m%d")
        for query in queries:
            startDate = start.strftime("%Y%m%d")
            endDate = end.strftime("%Y%m%d")
            logging.info("Working on %s." % query)
            logMessage = "Working on " + query + "..."
            print logMessage
            getArticles(startDate, endDate, query, api_key, json_file_path)
            parseArticles(query, "./output/output.tsv", json_file_path)
    except:
        logging.error("Unexpected error: %s", str(sys.exc_info()[0]))
    finally:
        logging.info("Finished.")
        print "Finished!"

if __name__ == '__main__' :
    main()