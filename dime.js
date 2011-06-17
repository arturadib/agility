// - - - - -
//
// Sandboxed definition
//
var $$ = (function(){

  if (!window.jQuery) {
    throw "dime.js: jQuery not found";
  }

  // Define a local jQuery $, in case $ is being used by another lib
  var $ = jQuery;
  
  // Global dime object (dimo) id counter
  var dimoId = 1;

  // Crockford's Object.create()
  if (typeof Object.create !== 'function') {
    Object.create = function(obj){
      var Aux = function(){};
      Aux.prototype = obj;
      return new Aux();
    }
  }
  
  // Main object builder
  var dime = function(){    

    // Object to be returned by builder
    var dimo = {};

    // Needs at least model
    if (arguments.length < 1) {
      throw 'dime.js: invalid number of arguments';
    }
    
    // Build from existing dimo
    if (typeof arguments[0] === "object" && typeof arguments[0]._dimoId === 'number') {
      dimo = Object.create(arguments[0]);      
      return dimo;
    } // build from dimo

    // Default dime object
    dimo = Object.create({

      // Global dime object identifier
      _dimoId: dimoId++,

      // Using immediate function to encapsulate _model
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
        render: function(){}
      },

      // Auxiliary
      add: function(){},
      remove: function(){}
    });
        
    // Build from shorthand model and view
    if (typeof arguments[0] === "string" && typeof arguments[1] === "string") {
      dimo.view.format = arguments[1];
      dimo.model({
        content: arguments[0]
      });
    }
    
    return dimo;
  } // dime

  return dime;
})();
