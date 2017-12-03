import json
import requests
import sys, os
import logging
import time
from os.path import join, exists
from datetime import date

def convert(input):
    if isinstance(input, dict):
        return {convert(key): convert(value) for key, value in input.iteritems()}
    elif isinstance(input, list):
        return [convert(element) for element in input]
    elif isinstance(input, unicode):
        return input.encode('utf-8')
    else:
        return input
    
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

def parseArticles(query, tsv_file_name):

    for file_number in range(101):
        # get the articles and put them into a dictionary
        try:
            #file_name = getJsonFileName(query,file_number, json_file_path)
            logging.info("Writing to %s", tsv_file_name)
            file_name = join("tempdata/articles",query + str(file_number+1)+".json")
            if os.path.isfile(file_name):
                in_file = open(file_name, 'r')
                articles = convert(json.loads(in_file.read()))
                in_file.close()
            else:
                break
        except IOError as e:
            logging.error("IOError in %s page %s: %s", query, e.errno, e.strerror)
            continue
        
        # if there are articles in that document, parse them
        if len(articles["response"]["results"]) >= 1:  

            # open the tsv for appending
            try:
                out_file = open(tsv_file_name, 'ab+')

            except IOError as e:
                logging.error("IOError: %s %s %s", query,  e.errno, e.strerror)
                continue
        
            # loop through the articles putting what we need in a tsv   
            try:
                for article in articles["response"]["results"]:
                    # if (article["source"] == "The New York Times" and article["document_type"] == "article"):
                    #keywords = ""
                    #keywords = getMultiples(article["keywords"],"value")
    
                    # should probably pull these if/else checks into a module
                    variables = [
                        query,
                        article["webPublicationDate"], 
                        #keywords, 
                        str(article["fields"]["headline"]).decode("utf8").replace("\n","") if "headline" in article["fields"].keys() else "", 
                        str(article["fields"]["publication"]).decode("utf8") if "publication" in article["fields"].keys() else "", 
                        str(article["type"]).decode("utf8") if "type" in article.keys() else "", 
                        article["webUrl"] if "webUrl" in article.keys() else "",
                        str(article["sectionName"]).decode("utf8") if "sectionName" in article.keys() else "",
                        str(article["fields"]["bodyText"]).decode("utf8").replace("\n","") if "bodyText" in article["fields"].keys() else "",
                        ]
                    line = "\t".join(variables)
                    out_file.write(line.encode("utf8")+"\n")
            except KeyError as e:
                logging.error("KeyError in %s: %s %s", query, e.errno, e.strerror)
                continue
            except (KeyboardInterrupt, SystemExit):
                raise
            except: 
                logging.error("Error on %s: %s", query, sys.exc_info()[0])
                continue
        
            out_file.close()
        else:
            break

def main():
    ARTICLES_DIR = join('tempdata', 'articles')
    #makedirs(ARTICLES_DIR, exist_ok=True)
    # Sample URL
    #
    # http://content.guardianapis.com/search?from-date=2016-01-02&
    # to-date=2016-01-02&order-by=newest&show-fields=all&page-size=200
    # &api-key=your-api-key-goes-here
    
    #MY_API_KEY = open("creds_guardian.txt").read().strip()
    API_ENDPOINT = 'http://content.guardianapis.com/search'
    my_params = {
        'from-date': "",
        'to-date': "",
        'order-by': "relevance",
        'show-fields': 'all',
        'page-size': 200,
        'api-key': "" #TO-DO: SET YOUR API KEY FOR THE GUARDIAN HERE
    }
    
    log_file = "./log/guardian-testing.log"
    logging.basicConfig(filename=log_file, level=logging.INFO)
    logging.info("Getting started.") 
    print "Getting started"
    
    # day iteration from here:
    # http://stackoverflow.com/questions/7274267/print-all-day-dates-between-two-dates
    start_date = date(1991, 1, 1)
    end_date = date(2016, 12, 31)
    
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
    #dayrange = range((end_date - start_date).days + 1)
    #for daycount in dayrange:
    try:
        for query in queries:
            #dt = start_date + timedelta(days=daycount)
            startdatestr = start_date.strftime('%Y-%m-%d')
            enddatestr = end_date.strftime('%Y-%m-%d')
            fname = join(ARTICLES_DIR, query)
            if not exists(fname):
                # then let's download it
                logging.info("Downloading %s", query)
                print("Downloading ", query)
                all_results = []
                my_params['from-date'] = startdatestr
                my_params['to-date'] = enddatestr
                current_page = 1
                total_pages = 1
                while current_page <= total_pages:
                    logging.info("...page %d", current_page)
                    print("...page", current_page)
                    my_params['page'] = current_page
                    my_params['q'] = query
                    resp = requests.get(API_ENDPOINT, my_params)
                    data = resp.json()
                    #all_results.extend(data['response']['results'])
                    all_results.extend(data['response'])
                    # if there is more than one page
                    current_page += 1
                    total_pages = data['response']['pages']
                    print ("total pages ", total_pages)
        
                    with open(fname + str(current_page-1)+".json", 'w') as f:
                        print("Writing to", fname + str(current_page-1)+".json")
                        logging.info("Writing to %s", fname + str(current_page-1)+".json")
            
                        # re-serialize it for pretty indentation
                        f.write(json.dumps(data, indent=2))
                    
                    time.sleep(1)
                parseArticles(query, "./output/Guardian.tsv")
                
    except:
        logging.error("Unexpected error: %s", str(sys.exc_info()[0]))            
    finally:
        print "Finished!" 
if __name__ == '__main__' :
    main()
