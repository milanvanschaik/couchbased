/*
  _____                 _     _                        _ 
 / ____|               | |   | |                      | |
| |     ___  _   _  ___| |__ | |__   __ _ ___  ___  __| |
| |    / _ \| | | |/ __| '_ \| '_ \ / _` / __|/ _ \/ _` |
| |___| (_) | |_| | (__| | | | |_) | (_| \__ \  __/ (_| |
 \_____\___/ \__,_|\___|_| |_|_.__/ \__,_|___/\___|\__,_|

*/

var uuid = require('node-uuid');

module.exports.createModel = function(name, fields, connection, callback) {

  var model = function(values) {

    if(!values) {

      values = {};

    }

    Object.keys(fields).forEach(function(key) {
      
      if(values[key] == undefined) {

        values[key] = '';

      }

    });

    var that = this;

    Object.keys(values).forEach(function(key) {

      that[key] = values[key];

    });

    Object.keys(model.statics).forEach(function(func) {

      model.prototype[func] = model.statics[func];

    });

    // Generate new id if not set (new)
    if(!this._id) {

      this._id = uuid.v4();

    }

    this._type = name;

  }

  model.createFunctionForView = function(viewName, functionName) {

    model[functionName] = function(query, callback) {

      var view = connection.view(name, viewName);

      // Set keys as key when only one key is given in keys,
      // then we don't get an error from Couchbase.
      if(typeof(query.keys) != 'Array' && query.keys) {

        query.key = query.keys;
        delete query.keys;

      }

      var return_only_value = true;

      if(query.return_only_value != undefined && query.return_only_value === false) {

        return_only_value = false;

      }

      view.query(query, function(error, results) {
        
        if(results[0] && results[0].value._id) {

          // Create couchbased object from each result
          results = results.map(model.unserialize);

          // Only return the concerning object when limit is set to one
          if(query.limit && query.limit == 1) {

            callback(error, results[0]);

          }

          else {

            callback(error, results);

          }

        }

        else {
          
          if(results.length == 1 && return_only_value) {

            callback(error, results[0].value);

          }

          else {

            callback(error, results);

          }

        }

      });

    }

  }

  model.createFunctionForView('all', 'all');

  model.validateField = function(field) {
    
    var validTypes = [String, Number, Array, Object, Date, Boolean];
    
    if(validTypes.indexOf(field) == -1) {

      // Give an specific error when a string is given as field type,
      // e.g. 'String' instead of String
      if(typeof(field) == 'string') {

        throw 'Invalid field type, it\'s a string: ' + field;

      }

      throw 'Invalid field type: ' + field;

    }

    return true;

  }

  model.statics = {};

  model.indexes = [];

  Object.keys(fields).forEach(function(key) {

    if(typeof(fields[key]) == 'object') {

      var field = fields[key];

      model.validateField(field.type);

      if(field.index) {

        model.indexes.push(key);

      }

    }

    else {

      model.validateField(fields[key]);

    }

  });

  model.createViews = function(callback) {
    
    // Get already already existing views and import them
    connection.getDesignDoc(name, function(error, doc) {

      var views = {};

      if(doc && doc.views) {

        views = doc.views;

      }

      var indexViews = {};

      model.indexes.forEach(function(index) {

        var key = 'by_' + index;

        indexViews[key] = { map: "// Created by Couchbased\nfunction(doc, meta) {\n\n  if(doc._type == \'"+ name +"\') {\n\n    emit(doc."+ index +", doc);\n\n  }\n\n}" };

      });

      Object.keys(views).forEach(function(viewName) {

        if(viewName != 'all') {

          if(!indexViews[viewName]) {

            indexViews[viewName] = views[viewName];

          }

        }

      });

      Object.keys(indexViews).forEach(function(viewName) {

        var functionName = '';

        viewName.split('_').forEach(function(comp) {

          functionName += comp.charAt(0).toUpperCase() + comp.slice(1);

        });

        functionName = functionName.charAt(0).toLowerCase() + functionName.slice(1);

        model.createFunctionForView(viewName, functionName);

      });

      indexViews['all'] = { map: "// Created by Couchbased\nfunction(doc, meta) {\n\n  if(doc._type == \'"+ name +"\') {\n\n    emit(null, doc);\n\n  }\n\n}" };

      connection.setDesignDoc(name, { views: indexViews }, function(error, results) {

        if(callback) {

          callback(error, results);

        }

      });

    });

  }

  model.prototype.save = function(callback) {

    var object = this;
    
    connection.set(object._type + '_' + object._id, object, function(error, result) {

      if(callback) {

        callback(error, { object: object, result: result });

      }

    });

  }

  model.prototype.remove = function(callback) {

    var object = this;

    connection.remove(object._type + '_' + object._id, function(error, result) {

      if(callback) {

        callback(error, result);

      }

    });

  }

  // byId isn't a view so this is a static function to get docs by id
  model.byId = function(id, callback, raw) {

    connection.get(name + '_' + id, function(error, result) {
      
      callback(error, model.unserialize(result));

    });

  }

  // Generates Couchbased objects from raw couchbase results
  model.unserialize = function(object) {

    return new model(object.value);

  }

  return model;
  
}