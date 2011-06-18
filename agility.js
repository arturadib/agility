// Sandbox it, so kids don't get hurt
var $$ = (function(){

  if (!window.jQuery) {
    throw "agility.js: jQuery not found";
  }

  // Define a local jQuery $, in case $ is being used by another lib
  var $ = jQuery;
  
  // Global agility object id counter
  var guid = 1;

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
    
    // Build from existing object
    if (typeof arguments[0] === "object" && typeof arguments[0].guid === 'number') {
      object = Object.create(arguments[0]);      
      return object;
    } // build from object

    // Default agility object
    object = Object.create({

      // Global agility object identifier
      guid: guid++,

      // List of sub-objects
      tree: [],
      
      // Using self-executing function to encapsulate _model
      model: (function(){
        var _model = {}; // private
        return function(arg){
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
      })(),

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
        if (typeof $$obj.guid !== 'number') {
          throw "agility.js: add argument is not an agility object";
        }
        this.tree.push($$obj);
        this.controller.add($$obj, args);        
        return this; // for chainable calls
      },
      remove: function(){},
      
      // Internal utility functions
      _: {
        // Scans object for functions and proxy their 'this' to object
        proxyAll: function(obj){
          for (var attr1 in obj) {
            // Root methods
            if (typeof obj[attr1] === 'function') {
              obj[attr1] = $.proxy(obj[attr1], obj);
            }
            // Sub-methods (model.*, view.*, controller.*)
            else if (typeof obj[attr1] === 'object') {
              for (var attr2 in obj[attr1]) {
                if (typeof obj[attr1][attr2] === 'function') {
                  obj[attr1][attr2] = $.proxy(obj[attr1][attr2], obj);
                }
              }
            } // if not func
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
