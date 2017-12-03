import datetime
import pymongo
import psycopg2
import psycopg2.extras
client = pymongo.MongoClient()
db = client.teammed

conn_string = "host='10.51.4.176' dbname='med' user='med' password='jucs[Oshbex5' port=28285"
conn = psycopg2.connect(conn_string)
cursor = conn.cursor()

adrs = db.ADR.find()
data = []
for a in adrs:
	#event_type, concept_name, text, date, source
	dateobj = datetime.datetime.strptime(a['date'], '%m/%d/%y')
	datestr = dateobj.isoformat()
	dat = ('ADR',a['drug_name'],a['tweet_text'],datestr,', '.join(a['list_adr']))
	data.append(dat)

# print data

insert_query = 'INSERT INTO events (event_type, concept_name, text, date, source) values %s'
psycopg2.extras.execute_values (
    cursor, insert_query, data, template=None, page_size=100
)

conn.commit()

conn.close()