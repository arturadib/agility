// Sandboxed, so kids don't get hurt
(function(window, undefined){

  if (!window.jQuery) {
    throw "agility.js: jQuery not found";
  }
  
  // Local reference
  var document = window.document,
  
  // In case $ is being used by another lib
  $ = jQuery,

  // Main agility object builder
  agility,

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
   return obj._agility === true;
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
        
    prototype = {
        
      _agility: true,
      
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
        var modelObject = function(arg, params){
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
            if (params && params.silent===true) {
              return this; // for chainable calls
            }
            this.trigger('change');
            return this; // for chainable calls
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
    
        // Default template will give rise to an empty jQuery object
        template: '<div/>',
    
        style: '',
    
        // Root jQuery object. Will contain view HTML, UI event bindings, etc
        $root: {},
    
        // Render is the main handler of $root. It's responsible for:
        //   - Creating jQuery object $root
        //   - Updating $root with DOM/HTML from template
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
              this.view.$root.html(this.view.template); // this won't destroy events bound to $root
            }
          }
          // Renders from model and template
          else {
            if (firstCall) {
              this.view.$root = $.tmpl(this.view.template, this.model()); // firstCall only, otherwise it would destroy $root's previously bound events
            }
            else {
              this.view.$root.html( $.tmpl(this.view.template, this.model()).html() ); // this won't destroy events bound to $root
            }
          }
          // Ensure we have a valid (non-empty) $root
          if (this.view.$root.size() === 0) {
            throw 'agility.js: invalid template';
          }
        },
    
        // Appends jQuery object $obj into selector of own jQuery object
        append: function($obj, selector){
          if (!$.isEmptyObject(this.view.$root)) {
            if (selector) this.view.$root.find(selector).append($obj);
            else this.view.$root.append($obj);
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
        init: function(event){},

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

      // Binds eventStr to fn. eventStr can be:
      //    'event'          : binds to custom event
      //    'event selector' : binds to DOM event using 'selector'
      bind: function(eventStr, fn){
        var spacePos = eventStr.search(/\s/);
        // DOM event 'event selector', e.g. 'click button'
        if (spacePos > -1) {
          var type = eventStr.substr(0, spacePos);
          var selector = eventStr.substr(spacePos+1);
          // Manually override selector 'root', as jQuery selectors can't select self object
          if (selector === 'root') {
            object.view.$root.bind(type, fn);
          }
          else {
            object.view.$root.delegate(selector, type, fn);
          }
        }
        // Custom 'event'
        else {
          $(customEventHolder).bind(eventStr, fn);
        }
        return this; // for chainable calls
      },

      // Triggers eventStr. Syntax for eventStr is same as that of bind()
      trigger: function(eventStr, params){
        var spacePos = eventStr.search(/\s/);
        // DOM event 'event selector', e.g. 'click button'
        if (spacePos > -1) {
          var type = eventStr.substr(0, spacePos);
          var selector = eventStr.substr(spacePos+1);
          // Manually override selector 'root', as jQuery selectors can't select self object
          if (selector === 'root') {
            object.view.$root.trigger(type, params);
          }
          else {
            object.view.$root.find(selector).trigger(type, params);
          }
        }
        // Custom 'event'
        else {
          $(customEventHolder).trigger(eventStr, params, params);
        }
        return this; // for chainable calls
      }
      
    }; // prototype

    // --------------------------
    //
    //  Build decisions
    //
    // --------------------------      

    // Build from agility object
    if (typeof arguments[0] === "object" && util.isAgility(arguments[0])) {
      object = Object.create(arguments[0]);      
      return object;
    } // build from agility object

    // Default agility object
    object = Object.create(prototype);
        
    // Builds the default prototype
    if (arguments.length === 0) {      
    }

    // Build object from {model,view,controller} object
    else if (arguments.length === 1 && typeof arguments[0] === 'object' && (arguments[0].model || arguments[0].view || arguments[0].controller) ) {
      if (arguments[0].model) {
        object.model(arguments[0].model, {silent:true}); // do not fire events
      }
      if (arguments[0].view) {
        $.extend(object.view, arguments[0].view);
      }
      if (arguments[0].controller) {
        $.extend(object.controller, arguments[0].controller);
      }
    }
    
    // Build object from (model, view, controller) arguments
    else {
      
      // Model from string ('hello world', ..., ...)
      if (typeof arguments[0] === 'string') {
        object.model({ 
          content: arguments[0]
        }, {silent:true}); // do not fire events
        object.view.template = '<div>${content}</div>'; // default template
      }

      // Model from object ({name:'asdf', email:'asdf@asdf.com'}, ..., ...)
      if (typeof arguments[0] === 'object') {
        object.model(arguments[0], {silent:true}); // do not fire events
      }

      // View from shorthand string (..., '<div>${whatever}</div>', ...)
      if (typeof arguments[1] === 'string') {
        object.view.template = arguments[1];
      }      

      // View from object (..., {template:'<div>${whatever}</div>'}, ...)
      if (typeof arguments[1] === 'object') {
        $.extend(object.view, arguments[1]);
      }      

      // Controller from object (..., ..., {method():function(){}})
      if (typeof arguments[2] === 'object') {
        $.extend(object.controller, arguments[2]);
      }      
      
    }
    
    // -----------------------------------------
    //
    //  Object bindings, initializations, etc
    //
    // -----------------------------------------
    
    // object.* will have their 'this' === object. This should come before call to object.* below (just in case).
    util.proxyAll(object);
    
    // Initialize $root, needed in the events binding below
    object.view.render();

    // Binds all controller functions to corresponding events
    for (ev in object.controller) {
      if (typeof object.controller[ev] === 'function') {
        object.bind(ev, object.controller[ev]);
      }
    }

    // Auto-triggers init event
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
      $root: $(document.body),
      render: function(){}
    }
  });

  // Globals
  window.agility = window.$$ = agility;
    
})(window);
