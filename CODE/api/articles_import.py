import pandas as pd 
from sqlalchemy import create_engine
engine = create_engine('postgresql://med:jucs[Oshbex5@10.51.4.176:28285/med')
# ['Drug', 'PublicationDate', 'Headline', 'Type', 'SectionName', 'Text', 'event_id']


df = pd.read_table('Articles.tsv')
# df = df.assign(event_type=['ARTICLE' for i in range(0,len(df))])
# df.rename(columns={'Drug':'concept_name','PublicationDate':'date','Type':'category'},inplace=True)
# df.drop('Headline',axis=1,inplace=True)
# df.drop('Type',axis=1,inplace=True)
# df.drop('SectionName',axis=1,inplace=True)
df.to_sql('article_event', engine)
print list(df) 