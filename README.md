# Couchbased
Advanced ODM for Couchbase

## Installation
Simply use NPM:
`npm install couchbased`

## Usage
### Create a model
```javascript
var User = couchbased.createModel('User', {
  name: String,
  username: { type: String, index: true }
}, bucket);
```

### Automatically create the views
```javascript
User.createViews();
```

### Get doc by id
```javascript
User.byId(id, function(error, result) {
  
  console.log(result);
  
});
```

### Get docs by view
When a field is indexed, Couchbased will automatically create a Couchbase view for it when running .createViews(). Also Couchbased will create a function for you. The first param of the function is always the key or the keys, second one is the query (limit, reduce etc.) and te last one is the callback (with params 1) error and 2) result)
e.g. If you field is called username (and is indexed):
```javascript
User.byUsername('john', function(error, result) {
  
  console.log(result);
  
});
```

### Query
In the query you can give all of couchbased default options, but Couchbased give you one more. Let's say you want a count of total users byUsername with a reduce. Then you probably only want the count. That's possible with return_only_value: true in the query.

## Thanks to
This module is inspired on the couchbase-odm module from Jesse van der Sar.
https://github.com/jessesar/couchbase-odm
