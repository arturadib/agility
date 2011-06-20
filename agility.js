// Sandboxed, so kids don't get hurt
(function(window, undefined){

  if (!window.jQuery) {
    throw "agility.js: jQuery not found";
  }
  
  // Local reference
  var document = window.document,
  
  // In case $ is being used by another lib
  $ = jQuery,

  // Agility object builder
  agility,

  // Global agility object id counter
  agilityId = 1,
  
  // Internal utility functions
  util = {};

  // Crockford's Object.create()
  if (typeof Object.create !== 'function') {
    Object.create = function(obj){
      var Aux = function(){};
      Aux.prototype = obj;
      return new Aux();
    }
  }  

  // --------------------------
  //
  //  util.*
  //
  // --------------------------      

  // Scans object for functions (depth=2) and proxies their 'this' to object
  util.proxyAll = function(obj){
    for (var attr1 in obj) {
      var proxied = obj[attr1]; // default is untouched
      // Proxy root methods
      if (typeof obj[attr1] === 'function') {
        proxied = obj[attr1]._noProxy ? obj[attr1] : $.proxy(obj[attr1], obj);
      }
      // Proxy sub-methods (model.*, view.*, etc)
      if (typeof obj[attr1] === 'function' || typeof obj[attr1] === 'object') {
        for (var attr2 in obj[attr1]) {
          var proxied2 = obj[attr1][attr2]; // default is untouched
          if (typeof obj[attr1][attr2] === 'function') {
            proxied2 = obj[attr1][attr2]._noProxy ? obj[attr1][attr2] : $.proxy(obj[attr1][attr2], obj);
          }
          proxied[attr2] = proxied2;
        } // for attr2
      } // if not func
      obj[attr1] = proxied;
    } // for attr1
  } // proxyAll
  
  // Checks if provided var is an agility object
  util.isAgility = function(obj){
   return typeof obj.agilityId === 'number';
  }
  
  // --------------------------
  //
  //  Main object builder
  //
  // --------------------------      

  // Main agility object builder
  agility = function(){    

    // Object to be returned by builder
    var object = {},
    
    // Private: custom event placeholder
    customEventHolder = {},
    
    // Private: jQuery object corresponding to the object's view. Placeholder for (UI) events, HTML, etc
    $object = $('<div/>'),
    
    prototype = {

      // Global agility object identifier
      agilityId: agilityId++,
        
      // --------------------------
      //
      //  Tree
      //
      // --------------------------
  
      tree: (function(){
        treeObject = [];
    
        // Adds a new object to tree, calls/fires necessary events
        treeObject.add = function(obj, selector){          
          if (!util.isAgility(obj)) {
            throw "agility.js: add argument is not an agility object";
          }
          this.tree.push(obj);
          this.trigger('add', [obj, selector]);
        };
    
        return treeObject;
      })(),
  
      // --------------------------
      //
      //  Model
      //
      // --------------------------
       
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

      // --------------------------
      //
      //  View
      //
      // --------------------------
    
      view: {
    
        format: '',
    
        style: '',
    
        $: function(selector){
          return selector ? $(selector, $object) : $object;
        },
    
        render: function(){
          if (this.view.format.length > 0) {
            if ($.isEmptyObject( this.model() )) {
              this.view.$().html( this.view.format ); // raw HTML
            }
            else {
              this.view.$().html( $.tmpl(this.view.format, this.model()) ); // templated HTML
            }
          }
        },
    
        // Appends content of $obj into selector of own jQuery object
        append: function($obj, selector){
          this.view.$(selector).append($obj);
        }
      },

      // --------------------------
      //
      //  Controller
      //
      // --------------------------
     
      controller: {

        // Called upon object creation
        init: function(event){
          this.view.render();
        },

        // Called when obj is added to tree
        add: function(event, obj, selector){
          this.view.append(obj.view.$(), selector);
        }
      },

      // --------------------------
      //
      //  Object methods
      //
      // --------------------------      

      // Shortcut to tree.add()
      add: function(){
        this.tree.add.apply(this, arguments);
        return this;
      },

      // Removes self, including from parent tree
      remove: function(){},

      // Binds eventStr to fn
      bind: function(eventStr, fn){
        $(customEventHolder).bind(eventStr, fn);
        return this;
      },

      // Triggers eventStr
      trigger: function(eventStr, params){
        $(customEventHolder).trigger(eventStr, params);
        return this;
      }
    }; // prototype
        
    // --------------------------
    //
    //  Build decisions
    //
    // --------------------------      

    // Build from agility object
    if (typeof arguments[0] === "object" && typeof arguments[0].agilityId === 'number') {
      object = Object.create(arguments[0]);      
      return object;
    } // build from agility object

    // Default agility object
    object = Object.create(prototype);
        
    // Builds the default prototype
    if (arguments.length === 0) {      
    }

    // Build from {model,view,controller} object
    else if (arguments.length === 1 && typeof arguments[0] === 'object' && (arguments[0].model || arguments[0].view || arguments[0].controller) ) {
      // model() must come last in order to call the newly defined view/controller methods
      if (arguments[0].controller) {
        $.extend(object.controller, arguments[0].controller);
      }
      if (arguments[0].view) {
        $.extend(object.view, arguments[0].view);
      }
      if (arguments[0].model) {
        object.model(arguments[0].model); // this will fire events
      }
    }
    
    // Build from shorthand model and view
    else if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string') {
      // model() must come last in order to call the newly defined view/controller methods
      object.view.format = arguments[1];
      object.model({ // this will fire events
        content: arguments[0]
      });
    }

    // -----------------------------------------
    //
    //  Object bindings, initializations, etc
    //
    // -----------------------------------------
    
    // object.* will have their 'this' === object
    util.proxyAll(object);

    // Binds all controller functions to corresponding events
    for (ev in object.controller) {
      if (typeof object.controller[ev] === 'function') {
        object.bind(ev, object.controller[ev]);
      }
    }
    
    // Calls controller.init()
    object.trigger('init');
    
    return object;
  } // agility

  // -----------------------------------------
  //
  //  agility.document
  //
  // -----------------------------------------

  agility.document = agility({
    view: {
      $: function(selector) {
        return selector ? $(selector, document.body) : $(document.body);
      }
    }
  });

  // Globals
  window.agility = window.$$ = agility;
    
})(window);
