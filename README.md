# Couchbased
Advanced ODM for Couchbase

## Installation
Simply use NPM:
`npm install couchbased`

## Usage
Create a model
```javascript
var User = couchbased.createModel('User', {
  name: String,
  username: { type: String, index: true }
}, bucket);
```

Automatically create the views
```javascript
User.createViews();
```

## Thanks to
This module is inspired on the couchbase-odm module from Jesse van der Sar.
https://github.com/jessesar/couchbase-odm
