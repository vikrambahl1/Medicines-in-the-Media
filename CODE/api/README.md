# api

Currently at http://tjg.pub/api/

## Endpoints

### GET `/tweets/<drugname>`

Returns
```
{
  'count': Number of Tweets
  'tweets': [
    {
      'text': 'Text of tweet #neat',
      'timestamp_ms': 'Timestamp of when tweet was created',
      'user': {Twitter user object}
    }
  ]
}
```

### GET `/counts/<drugname>`

Returns 
```
[
  {
    'year': 'year',
    'count': 'Number of prescriptions for that year'
  }
]
```



### GET `/countsBreakdown/<drugname>`

Returns 
```
[
  {
    'year': 'year',
    'quarter': 'quarter',
    'state': 'Two-letter state abbreviation',
    'count': 'Number of prescriptions for that year/state/quarter'
  }
]
```

