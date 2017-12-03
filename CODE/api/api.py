import pymongo
import json
import logging
import sys
from flask import Flask, request
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from datetime import date, datetime
from nltk.sentiment.vader import SentimentIntensityAnalyzer

logging.basicConfig(stream=sys.stderr)

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

application = Flask(__name__)
CORS(application)
client = pymongo.MongoClient()
db = client.teammed


# conn_string = "host='fhirtesting.hdap.gatech.edu' dbname='hdap_student_proj' user='hdap_student_proj' password='aefeeK5Iab4' port=11000"
conn_string = "host='10.51.4.176' dbname='med' user='med' password='jucs[Oshbex5' port=28285"

@application.route("/")
def hello():
    return "Hello teammed"

@application.route('/tweets/<drugname>/')
def getTweets(drugname):
    q = db.tweets.find({ '$text' : { '$search' : drugname} },{'text':1,'_id':0,'user':1,'timestamp_ms':1}).sort([("_id",-1)]).limit(10)
    c = db.tweets.count({ '$text' : { '$search' : drugname} })
    res = {'count':c,'tweets':[]}
    for tweet in q:
        res['tweets'].append(tweet)
    return json.dumps(res)

@application.route('/countsBreakdown/<drugname>/')
def getCountsBreakdown(drugname):
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()
    cursor.execute("""
                 SELECT  year, quarter, state, sum(number_of_prescriptions) 
                 FROM    medicaid_data
                 WHERE   concept_name=%s and state !='XX'
                 GROUP BY year, quarter, state
                 """,(drugname,))
    row = cursor.fetchall()
    resp = []
    if cursor.rowcount == 0:
        return json.dumps(resp)
    for r in row:
        obj = {'year':r[0],'quarter':r[1],'state':r[2],'prescriptions':r[3]}
        resp.append(obj)
    conn.close()
    return json.dumps(resp)

@application.route('/sqltest/')
def sqltest():
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()

    cursor.execute("""
                SELECT  year, sum(number_of_prescriptions)
                 FROM    medicaid_data
                 GROUP BY year
                 ORDER BY year ASC
                 """)
    row = cursor.fetchall()
    conn.close()
    return json.dumps(row)


@application.route('/adr/<drugname>/')
def getADR(drugname):
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cursor.execute("""
                 SELECT  *
                 FROM    events
                 WHERE   concept_name ILIKE %s AND event_type ='ADR'
                 """,(drugname,))
    #return drugname
    rows = cursor.fetchall()
    resp = []
    if cursor.rowcount == 0:# or not row or len(rows) == 0:
        return json.dumps(resp)
    for r in rows:
        resp.append(r)
    conn.close()
    return json.dumps(resp, default=json_serial)

@application.route('/events/<drugname>/')
def getEvents(drugname):
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cursor.execute("""
                 SELECT  *
                 FROM    events
                 WHERE   concept_name ILIKE %s AND event_type !='ADR'
                 """,(drugname,))
    #return drugname
    rows = cursor.fetchall()
    resp = []
    if cursor.rowcount == 0:# or not row or len(rows) == 0:
        return json.dumps(resp)
    for r in rows:
        resp.append(r)
    conn.close()
    return json.dumps(resp, default=json_serial)

@application.route('/faers/<drugname>/')
def getFaers(drugname):
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cursor.execute("""
                 SELECT COUNT(*) as num, outc_cod, datestr FROM faers_drug fd
                    JOIN faers_outcome fo ON fd.caseid=fo.caseid
                    JOIN faers_demo fdemo ON fd.caseid=fdemo.caseid
                    WHERE fd.prod_ai ILIKE %s
                GROUP BY datestr, outc_cod;
                 """,(drugname,))
    #return drugname
    rows = cursor.fetchall()
    resp = []
    if cursor.rowcount == 0:# or not row or len(rows) == 0:
        return json.dumps(resp)
    for r in rows:
        resp.append(r)
    conn.close()
    return json.dumps(resp, default=json_serial)

@application.route('/counts/<drugname>/')
def getCounts(drugname):
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()

    cursor.execute("""
                 SELECT  year, sum(number_of_prescriptions)
                 FROM    medicaid_data
                 WHERE   concept_name=%s AND state != 'XX'
                 GROUP BY year
                 ORDER BY year ASC
                 """,(drugname,))
    #return drugname
    rows = cursor.fetchall()
    resp = []
    if cursor.rowcount == 0:# or not row or len(rows) == 0:
        return json.dumps(resp)
    for r in rows:
        # print r
        obj = {'year':r[0],'prescriptions':r[1]}
        resp.append(obj)
    conn.close()
    return json.dumps(resp)


@application.route('/sentiment/', methods = ['GET', 'POST'])
def getSentiment():
	if not request.data:
		return 'No data received. Requst Format: POST request with JSON array of strings ["str1","str2"]', 400
	try:
		req = json.loads(request.data)
	except Exception as e:
		return 'Failed to load JSON. ' + e, 400
	
	result = []
	for r in req:
		sid = SentimentIntensityAnalyzer()
		ss = sid.polarity_scores(r)
		result.append(ss)
	return json.dumps(result)

if __name__ == "__main__":
    application.run()

