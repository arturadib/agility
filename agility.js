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
  util = {},
  
  // Default object prototype
  defaultPrototype = {},
  
  // Global object counter
  idCounter = 0;

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
  
  // Checks if provided obj is an agility object
  util.isAgility = function(obj){
   return obj._agility === true;
  }

  // Scans object for functions (depth=2) and proxies their 'this' to dest.
  // To ensure it works with previously proxied objects, we save the original function as 
  // a '._preProxy' method and when available always use that as the proxy source.
  util.proxyAll = function(obj, dest){
    if (!obj || !dest) {
      throw "agility.js: util.proxyAll needs two arguments";
    }
    for (var attr1 in obj) {
      var proxied = obj[attr1]; // default is untouched
      // Proxy root methods
      if (typeof obj[attr1] === 'function') {
        proxied = obj[attr1]._noProxy ? obj[attr1] : $.proxy(obj[attr1]._preProxy || obj[attr1], dest);
        proxied._preProxy = obj[attr1]._noProxy ? undefined : (obj[attr1]._preProxy || obj[attr1]); // save original
      }
      // Proxy sub-methods (model.*, view.*, etc)
      else if (typeof obj[attr1] === 'object') {
        for (var attr2 in obj[attr1]) {
          var proxied2 = obj[attr1][attr2]; // default is untouched
          if (typeof obj[attr1][attr2] === 'function') {
            proxied2 = obj[attr1][attr2]._noProxy ? obj[attr1][attr2] : $.proxy(obj[attr1][attr2]._preProxy || obj[attr1][attr2], dest);
            proxied2._preProxy = obj[attr1][attr2]._noProxy ? undefined : (obj[attr1][attr2]._preProxy || obj[attr1][attr2]); // save original
          }
          proxied[attr2] = proxied2;
        } // for attr2
      } // if not func
      obj[attr1] = proxied;
    } // for attr1
  } // proxyAll
    
  // ------------------------------
  //
  //  Default object prototype
  //
  // ------------------------------
  
  defaultPrototype = {
    
    _agility: true,

    // -------------
    //
    //  Model
    //
    // -------------
       
    model: {

      // Setter
      set: function(arg, params) {
        if (typeof arg === 'string') {
          this.model._data.text = arg; // default model attribute
        }
        else if (typeof arg === 'object') {
          this.model._data = arg;
        }
        else {
          throw "agility.js: unknown argument type (model.set)";
        }
        if (params && params.silent===true) return this; // do not fire event
        this.trigger('change');
        return this; // for chainable calls
      },
      
      // Getter
      get: function(arg){
        // Full model getter
        if (typeof arg === 'undefined') {
          return this.model._data;
        }
        // Attribute getter
        if (typeof arg === 'string') {            
          return this.model._data[arg];
        }
        throw 'agility.js: unknown argument for getter';
      },
  
      // Persistence: save
      save: function(){},
  
      // Persistence: load
      load: function(){},
      
      // Persistence: delete
      delete: function(){}
      
    }, // model prototype
  
    // -------------
    //
    //  View
    //
    // -------------
  
    view: {
        
      // Render is the main handler of $root. It's responsible for:
      //   - Creating the jQuery object $root
      //   - Updating $root with DOM/HTML from template
      render: function(){
        // Without template there is no view
        if (this.view.template.length === 0) {
          return;
        }
        var firstCall = $.isEmptyObject(this.view.$root);
        // Renders template without data, if no model
        if ($.isEmptyObject( this.model.get() )) {
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
            this.view.$root = $.tmpl(this.view.template, this.model.get()); // firstCall only, otherwise it would destroy $root's previously bound events
          }
          else {
            this.view.$root.html( $.tmpl(this.view.template, this.model.get()).html() ); // this won't destroy events bound to $root
          }
        }
        // Ensure we have a valid (non-empty) $root
        if (this.view.$root.size() === 0) {
          throw 'agility.js: invalid template';
        }
      }, // render
  
      // Appends jQuery object $obj into selector of own jQuery object
      append: function($obj, selector){
        if (!$.isEmptyObject(this.view.$root)) {
          if (selector) this.view.$root.find(selector).append($obj);
          else this.view.$root.append($obj);
        }
      }, // append
      
      // Remove DOM object
      remove: function(){
        this.view.$root.remove();
      }
      
    }, // view prototype
  
    // -------------
    //
    //  Controller
    //
    // -------------
   
    controller: {
  
      // Called upon object creation
      init: function(event){},
  
      // Called after obj is added to tree
      add: function(event, obj, selector){
        this.view.append(obj.view.$root, selector);
      },
      
      // Called after model changes
      change: function(event){
        this.view.render();
      },
      
      // Called when self-removed
      remove: function(event){
        this.view.remove();
        this.model.delete();
      },
      
      // Called when a child removes itself
      removeChild: function(event, id){
        delete this._tree.children[id];
      }
      
    }, // controller prototype

    // -------------
    //
    //  _Tree
    //
    // -------------
    
    _tree: {

      // Adds an object to the tree, listens for child removal
      add: function(obj, selector){
        if (!util.isAgility(obj)) {
          throw "agility.js: add argument is not an agility object";
        }
        this._tree.children[obj._id] = obj;
        this.trigger('add', [obj, selector]);
        obj.bind('remove', this.controller.removeChild);
        return this;
      },

      // Removes itself (including from parent tree)
      remove: function(){
        this.trigger('remove', this._id); // parent must listen to 'remove' event and handle tree removal
      }

    },
    
    // -------------
    //
    //  _Events
    //
    // -------------
    
    _events: {

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
            this.view.$root.bind(type, fn);
          }
          else {          
            this.view.$root.delegate(selector, type, fn);
          }
        }
        // Custom 'event'
        else {
          $(this._events.data).bind(eventStr, fn);
        }
        return this; // for chainable calls
      }, // bind

      // Triggers eventStr. Syntax for eventStr is same as that for bind()
      trigger: function(eventStr, params){
        var spacePos = eventStr.search(/\s/);
        // DOM event 'event selector', e.g. 'click button'
        if (spacePos > -1) {
          var type = eventStr.substr(0, spacePos);
          var selector = eventStr.substr(spacePos+1);
          // Manually override selector 'root', as jQuery selectors can't select self object
          if (selector === 'root') {
            this.view.$root.trigger(type, params);
          }
          else {
            this.view.$root.find(selector).trigger(type, params);
          }
        }
        // Custom 'event'
        else {
          $(this._events.data).trigger(eventStr, params, params);
        }
        return this; // for chainable calls
      } // trigger
      
    },

    // -------------
    //
    //  Shortcuts
    //
    // -------------
        
    //
    // _Tree shortcuts
    //

    // Shortcut to _tree.add()
    add: function(){      
      this._tree.add.apply(this, arguments);
      return this; // for chainable calls
    },

    // Shortcut to _tree.remove()
    remove: function(){
      this._tree.remove.apply(this, arguments);
      return this; // for chainable calls
    },

    //
    // _Events shortcuts
    //

    // Shortcut to _events.bind()
    bind: function(){
      this._events.bind.apply(this, arguments);
      return this; // for chainable calls
    },

    // Shortcut to _events.trigger()
    trigger: function(){
      this._events.trigger.apply(this, arguments);
      return this; // for chainable calls
    },
    
    //
    // Model shortcuts
    //

    // Shortcut to model.set()
    set: function(){
      this.model.set.apply(this, arguments);
      return this; // for chainable calls
    }, // set
    
    // Shortcut to model.get()
    get: function(){
      return this.model.get.apply(this, arguments);        
    },
  
    //
    // View shortcuts
    //

    // Shortcut to view.$root
    $: function(selector){
      return selector ? this.view.$root.find(selector) : this.view.$root;
    }

  } // prototype
  
  // --------------------------
  //
  //  Main object builder
  //
  // --------------------------      
  
  // Main agility object builder
  agility = function(){
    
    // Real array of arguments
    var args = Array.prototype.slice.call(arguments, 0),
    
    // Object to be returned by builder
    object = {},
    
    prototype = defaultPrototype;
            
    // Build object from given prototype
    if (typeof args[0] === "object" && util.isAgility(args[0])) {
      prototype = args[0];
      args.shift(); // remaining args now work as though object wasn't specified
    } // build from agility object
    
    // Build object from prototype as well as the individual prototype parts model, view, controller
    // This enables differential inheritance at the sub-object level, e.g. object.view.template
    object = Object.create(prototype);
    object.model = Object.create(prototype.model);
    object.view = Object.create(prototype.view);
    object.controller = Object.create(prototype.controller);
    object._tree = Object.create(prototype._tree);
    object._events = Object.create(prototype._events);

    // Reset object-specific data so that they're 'own' properties
    object._id = idCounter++;
    object._events.data = {}; // don't inherit custom events; new bindings will happen below
    object.model._data = object.model._data ? $.extend({}, object.model._data) : {}; // model is copied
    object._tree.children = {}; // don't inherit tree data
    object.view.template = object.view.template || '<div>${text}</div>';
    object.view.style = object.view.style || '';
    object.view.$root = {}; // don't inherit jQuery object; new bindings will happen below
  
    // -----------------------------------------
    //
    //  Extend model, view, controller
    //
    // -----------------------------------------

    // Just the default prototype
    if (args.length === 0) {
    }
  
    // Prototype differential from {model,view,controller} object
    else if (args.length === 1 && typeof args[0] === 'object' && (args[0].model || args[0].view || args[0].controller) ) {
      if (args[0].model) {
        $.extend(object.model._data, args[0].model);
      }
      if (args[0].view) {
        $.extend(object.view, args[0].view);
      }
      if (args[0].controller) {
        $.extend(object.controller, args[0].controller);
      }
    } // {model, view, controller} arg
    
    // Prototype differential from ({model}, {view}, {controller}) arguments
    else {
      
      // Model from string
      if (typeof args[0] === 'string') {
        $.extend(object.model._data, {text: args[0]});
      }
      else if (typeof args[0] === 'object') {
        $.extend(object.model._data, args[0]);
      }
      else if (args[0]) {
        throw "agility.js: unknown argument type (model)"
      }

      // View from shorthand string (..., '<div>${whatever}</div>', ...)
      if (typeof args[1] === 'string') {
        object.view.template = args[1]; // extend view with .template
      }  
      // View from object (..., {template:'<div>${whatever}</div>'}, ...)
      else if (typeof args[1] === 'object') {
        $.extend(object.view, args[1]);
      }      
      else if (args[1]) {
        throw "agility.js: unknown argument type (view)";
      }
      
      // Controller from object (..., ..., {method():function(){}})
      if (typeof args[2] === 'object') {
        $.extend(object.controller, args[2]);
      }
      else if (args[2]) {
        throw "agility.js: unknown argument type (controller)";
      }
      
    } // ({model}, {view}, {controller}) args
    
    // -----------------------------------------
    //
    //  Bindings, initializations, etc
    //
    // -----------------------------------------
  
    // object.* will have their 'this' === object. This should come before call to object.* below.
    util.proxyAll(object, object);

    // Initialize $root, needed for DOM events binding below
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
  //  Document object
  //
  // -----------------------------------------
  
  agility.document = agility({}, {}, {
    init: function(){
      this.view.$root = $(document.body)
    }
  });

  // Globals
  window.agility = window.$$ = agility;
    
})(window);
