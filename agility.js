// Sandbox, so kids don't get hurt
var $$ = (function(){

  if (!window.jQuery) {
    throw "agility.js: jQuery not found";
  }

  // Define a local jQuery $, in case $ is being used by another lib
  var $ = jQuery;
  
  // Global agility object id counter
  var agilityId = 1;

  // Crockford's Object.create()
  if (typeof Object.create !== 'function') {
    Object.create = function(obj){
      var Aux = function(){};
      Aux.prototype = obj;
      return new Aux();
    }
  }
  
  // Main agility object builder
  var agility = function(){    

    // Object to be returned by builder
    var object = {};

    // Needs at least model
    if (arguments.length < 1) {
      throw 'agility.js: invalid number of arguments';
    }
    
    // Build from agility object
    if (typeof arguments[0] === "object" && typeof arguments[0].agilityId === 'number') {
      object = Object.create(arguments[0]);      
      return object;
    } // build from agility object

    // Default agility object
    object = Object.create({

      // Global agility object identifier
      agilityId: agilityId++,
      
      // Using self-executing function to encapsulate _model
      model: (function(){
        var _model = {}; // private
        
        // Setter, getter
        var modelObject = function(arg){
          // Model getter
          if (typeof arg === 'undefined') {
            return _model;
          }
          // Attribute getter
          if (typeof arg === 'string') {                        
            return _model[arg];
          }
          // Model setter
          if (typeof arg === 'object') {
            _model = arg;
            return;
          }
        }
        
        // Persistence: save
        modelObject.save = function(){};

        // Persistence: load
        modelObject.load = function(){};
        
        return modelObject;
      })(),

      // Array of sub-objects
      tree: [],

      view: {
        format: '',
        style: '',
        render: function(){},
        append: function(){}
      },

      controller: {
        init: function(){},
        render: function(){},
        add: function(){}
      },

      // Add a new object to current one, call event handlers
      add: function($$obj, args){
        if (typeof $$obj.agilityId !== 'number') {
          throw "agility.js: add argument is not an agility object";
        }
        this.tree.push($$obj);
        this.controller.add($$obj, args);        
        return this; // for chainable calls
      },
      remove: function(){},
      
      // Internal utility functions
      _: {
        // Scan object for functions (depth=2) and proxy their 'this' to object
        proxyAll: function(obj){
          for (var attr1 in obj) {
            var proxied = obj[attr1]; // default is untouched
            // Proxy root methods
            if (typeof obj[attr1] === 'function') {
              proxied = $.proxy(obj[attr1], obj);
            }
            // Proxy sub-methods (model.*, view.*, controller.*)
            if (typeof obj[attr1] === 'function' || typeof obj[attr1] === 'object') {
              for (var attr2 in obj[attr1]) {
                var proxied2 = obj[attr1][attr2]; // default is untouched
                if (typeof obj[attr1][attr2] === 'function') {
                  proxied2 = $.proxy(obj[attr1][attr2], obj);
                }
                proxied[attr2] = proxied2;
              } // for attr2
            } // if not func
            obj[attr1] = proxied;
          } // for attr1
        } // proxyAll
      } // _
    });
        
    // Build from shorthand model and view
    if (typeof arguments[0] === "string" && typeof arguments[1] === "string") {
      object.view.format = arguments[1];
      object.model({
        content: arguments[0]
      });
    }
    
    // object.* will have their 'this' === object
    object._.proxyAll(object);

    return object;
  } // agility

  // Document object
  agility.document = agility('asdf', 'asdf');

  return agility;
})();
