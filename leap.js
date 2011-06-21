// Sandboxed, so kids don't get hurt
(function(window, undefined){

  if (!window.jQuery) {
    throw "leap.js: jQuery not found";
  }
  
  // Local reference
  var document = window.document,
  
  // In case $ is being used by another lib
  $ = jQuery,

  // Main leap object builder
  leap,

  // Global leap object id counter
  leapId = 1,
  
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
  
  // Checks if provided var is an leap object
  util.isLeap = function(obj){
   return typeof obj.leapId === 'number';
  }
  
  // --------------------------
  //
  //  Main object builder
  //
  // --------------------------      

  // Main leap object builder
  leap = function(){    

    // Object to be returned by builder
    var object = {},
    
    // Private: custom event placeholder
    customEventHolder = {},
        
    prototype = {

      // Global leap object identifier
      leapId: leapId++,
        
      // --------------------------
      //
      //  Tree
      //
      // --------------------------
  
      tree: (function(){
        treeObject = [];
    
        // Adds a new object to tree, calls/fires necessary events
        treeObject.add = function(obj, selector){          
          if (!util.isLeap(obj)) {
            throw "leap.js: add argument is not an leap object";
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
            this.trigger('change');
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
    
        template: '<div>${content}</div>',
    
        style: '',
    
        // Root jQuery object, contains view HTML, UI event bindings, etc
        $root: {},
    
        render: function(){
          // Without template there is no view
          if (this.view.template.length === 0) {
            return;
          }
          var firstCall = $.isEmptyObject(this.view.$root);
          // Renders template without data, if no model
          if ($.isEmptyObject( this.model() )) {
            if (firstCall) {
              this.view.$root = $(this.view.template); // firstCall only, otherwise it would destroy $root's previously bound events
            }
            else {
              this.view.$root.html(this.view.template); // raw HTML
            }
          }
          // Renders from model and template
          else {
            if (firstCall) {
              this.view.$root = $.tmpl(this.view.template, this.model()); // firstCall only, otherwise it would destroy $root's previously bound events
            }
            else {
              this.view.$root.html( $.tmpl(this.view.template, this.model()).html() );
            }
          }
          // At this point we should have a valid (non-empty) $root
          if (this.view.$root.size() === 0) {
            throw 'leap.js: invalid template';
          }          
        },
    
        // Appends jQuery object $obj into selector of own jQuery object
        append: function($obj, selector){
          if (!$.isEmptyObject(this.view.$root)) {
            this.view.$root.append($obj);
          }
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
          this.view.append(obj.view.$root, selector);
        },
        
        // Called when model changes
        change: function(){
          this.view.render();
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

    // Build from leap object
    if (typeof arguments[0] === "object" && typeof arguments[0].leapId === 'number') {
      object = Object.create(arguments[0]);      
      return object;
    } // build from leap object

    // Default leap object
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
      object.view.template = arguments[1];
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
  } // leap

  // -----------------------------------------
  //
  //  leap.document
  //
  // -----------------------------------------

  leap.document = leap({
    view: {
      template: document.body // hack; with an empty model this will set $root = $(template) on first call
    }
  });

  // Globals
  window.leap = window.$$ = leap;
    
})(window);
