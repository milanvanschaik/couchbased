# Couchbased
Advanced ODM for Couchbase

## Installation
Simply use NPM:
`npm install couchbased`

## Usage
### Create a model
When a field is indexed, Couchbased will automatically create a Couchbase view for you when running .createViews().
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

## Thanks to
This module is inspired on the couchbase-odm module from Jesse van der Sar.
https://github.com/jessesar/couchbase-odm
