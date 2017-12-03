NYT
====================

Python tools for getting data from the New York Times Article API. Retrieves JSON from the API, stores it, parses it into a TSV file.
Multiple queries are output into a single TSV file.

New York Times Article API Docs: http://developer.nytimes.com/docs/read/article_search_api_v2

Requesting an API Key for the Times API: http://developer.nytimes.com/docs/reference/keys

## Dependencies
Python v2.7 (not tested on any others)

## Why store the JSON files? Why not just parse them?
The New York Times is nice enough to allow programmatic access to its articles, but that doesn't mean I should query the API every time I want data. Instead, I query it once and cache the raw data, lessening the burden on the Times API. Then, I parse that raw data into whatever format I need - in this case a tab-delimited file with only some of the fields - and leave the raw data alone. Next time I have a research question that relies on the same articles, I can just re-parse the stored JSON files into whatever format helps me answer my new question.

## Usage
Set your variables in the config file (copy settings_example.cfg to settings.cfg).
You will need to add the following directories in the same location as getTimesArticles.py for proper operation:
json/
log/
output/

```python getTimesArticles.py```
