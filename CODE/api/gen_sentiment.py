import psycopg2
import psycopg2.extras
from nltk.sentiment.vader import SentimentIntensityAnalyzer

conn_string = "host='10.51.4.176' dbname='med' user='med' password='jucs[Oshbex5' port=28285"
conn = psycopg2.connect(conn_string)
cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

cursor.execute("""
                 SELECT  * 
                 FROM    events
                 WHERE   event_type != 'FDA_APPROVAL'
				 AND text NOTNULL
                 """)
rows = cursor.fetchall()
i = 0
for r in rows:
	sid = SentimentIntensityAnalyzer()
	ss = sid.polarity_scores(r['text'])
	id = r['event_id']
	cursor.execute("""
		UPDATE events 
		SET
			sentiment_pos=%s,
			sentiment_neu=%s,
			sentiment_neg=%s,
			overall_score=%s
		WHERE event_id=%s
	""",(ss['pos'],ss['neu'],ss['neg'],ss['compound'],id,))
	i += 1
	if i % 100 == 0:
		print i

conn.commit()
conn.close()