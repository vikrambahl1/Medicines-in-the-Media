Application.py - Queries both the NYT and The Guardian APIs for 10 articles each and sorts them based upon the users preference of ascending or descending order by date of publication.
The query uses the date range 1/1/91 to the current day.

OPERATION: python Application.py <Query> <SortPreference>
Query - The word to search for on the two news sources
SortPreference - Either "oldest", "newest", or "relevance" for determining the order of the results

No output, but creates a dictionary object from the API JSON of the information for the user to integrate into their project or expand on
