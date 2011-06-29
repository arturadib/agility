// Sandboxed, so kids don't get hurt. Inspired by jQuery's code.
// Also:
//   Creates local ref to window for performance reasons (as JS looks up local vars first)
//   Redefines undefined as it could have been tampered with
(function(window, undefined){

  if (!window.jQuery) {
    throw "agility.js: jQuery not found";
  }
  
  // Local references
  var document = window.document,
      location = window.location,
  
  // In case $ is being used by another lib
  $ = jQuery,

  // Main agility object builder
  agility,

  // Internal utility functions
  util = {},
  
  // Default object prototype
  defaultPrototype = {},
  
  // Global object counter
  idCounter = 0,
  
  // Constant
  ROOT_SELECTOR = '&';

  // --------------------------
  //
  //  Modernizing old JS
  //
  // --------------------------      

  // Douglas Crockford's Object.create()
  if (typeof Object.create !== 'function') {
    Object.create = function(obj){
      var Aux = function(){};
      Aux.prototype = obj;
      return new Aux();
    };
  }
  
  // John Resig's Object.getPrototypeOf()
  if ( typeof Object.getPrototypeOf !== "function" ) {
    if ( typeof "test".__proto__ === "object" ) {
      Object.getPrototypeOf = function(object){
        return object.__proto__;
      };
    } else {
      Object.getPrototypeOf = function(object){
        // May break if the constructor has been tampered with
        return object.constructor.prototype;
      };
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
  };

  // Scans object for functions (depth=2) and proxies their 'this' to dest.
  // To ensure it works with previously proxied objects, we save the original function as 
  // a '._preProxy' method and when available always use that as the proxy source.
  util.proxyAll = function(obj, dest){
    if (!obj || !dest) {
      throw "agility.js: util.proxyAll needs two arguments";
    }
    for (var attr1 in obj) {
      var proxied = obj[attr1];
      // Proxy root methods
      if (typeof obj[attr1] === 'function') {
        proxied = obj[attr1]._noProxy ? obj[attr1] : $.proxy(obj[attr1]._preProxy || obj[attr1], dest);
        proxied._preProxy = obj[attr1]._noProxy ? undefined : (obj[attr1]._preProxy || obj[attr1]); // save original
        obj[attr1] = proxied;
      }
      // Proxy sub-methods (model.*, view.*, etc)
      else if (typeof obj[attr1] === 'object') {
        for (var attr2 in obj[attr1]) {
          var proxied2 = obj[attr1][attr2];
          if (typeof obj[attr1][attr2] === 'function') {
            proxied2 = obj[attr1][attr2]._noProxy ? obj[attr1][attr2] : $.proxy(obj[attr1][attr2]._preProxy || obj[attr1][attr2], dest);
            proxied2._preProxy = obj[attr1][attr2]._noProxy ? undefined : (obj[attr1][attr2]._preProxy || obj[attr1][attr2]); // save original
            proxied[attr2] = proxied2;
          }
        } // for attr2
        obj[attr1] = proxied;
      } // if not func
    } // for attr1
  }; // proxyAll
  
  // Determines # of attributes of given object (prototype inclusive)
  util.size = function(obj){
    var size = 0, key;
    for (key in obj) {
      size++;
    }
    return size;
  };
  
  // ------------------------------
  //
  //  Default object prototype
  //
  // ------------------------------
  
  defaultPrototype = {
    
    _agility: true,
    
    // -------------
    //
    //  _Events
    //
    // -------------
    
    _events: {

      // Parses event string like:
      //    'event'          : custom event
      //    'event selector' : DOM event using 'selector'
      parseEventStr: function(eventStr){
        var eventObj = { type:eventStr }, 
            spacePos = eventStr.search(/\s/);
        // DOM event 'event selector', e.g. 'click button'
        if (spacePos > -1) {
          eventObj.type = eventStr.substr(0, spacePos);
          eventObj.selector = eventStr.substr(spacePos+1);
        }
        return eventObj;
      },

      // Binds eventStr to fn. eventStr is parsed as per parseEventStr()
      bind: function(eventStr, fn){
        var eventObj = this._events.parseEventStr(eventStr);
        // DOM event 'event selector', e.g. 'click button'
        if (eventObj.selector) {
          // Manually override root selector, as jQuery selectors can't select self object
          if (eventObj.selector === ROOT_SELECTOR) {
            this.view.$root.bind(eventObj.type, fn);
          }
          else {          
            this.view.$root.delegate(eventObj.selector, eventObj.type, fn);
          }
        }
        // Custom event
        else {
          $(this._events.data).bind(eventObj.type, fn);
        }
        return this; // for chainable calls
      }, // bind

      // Triggers eventStr. Syntax for eventStr is same as that for bind()
      trigger: function(eventStr, params){
        var eventObj = this._events.parseEventStr(eventStr);
        // DOM event 'event selector', e.g. 'click button'
        if (eventObj.selector) {
          // Manually override root selector, as jQuery selectors can't select self object
          if (eventObj.selector === ROOT_SELECTOR) {
            this.view.$root.trigger(eventObj.type, params);
          }
          else {          
            this.view.$root.find(eventObj.selector).trigger(eventObj.type, params);
          }
        }
        // Custom event
        else {
          $(this._events.data).trigger('_'+eventObj.type, params);
          $(this._events.data).trigger(eventObj.type, params);
        }
        return this; // for chainable calls
      } // trigger
      
    }, // _events

    // -------------
    //
    //  Model
    //
    // -------------
       
    model: {

      // Setter
      set: function(arg, params) {
        var self = this;
        var modified = [];
        if (typeof arg === 'string') {
          this.model._data.text = arg; // default model attribute
          modified.push('text');
        }
        else if (typeof arg === 'object') {
          this.model._data = arg;
          for (var key in arg) {
            modified.push(key);
          }
        }
        else {
          throw "agility.js: unknown argument type in model.set()";
        }

        // Events
        if (params && params.silent===true) return this; // do not fire events
        this.trigger('modelChange');
        $.each(modified, function(index, val){
          self.trigger('modelChange:'+val);
        });
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
      
      // Number of model properties
      size: function(){
        return util.size(this.model._data);
      },
      
      // Convenience function - loops over each model property
      each: function(fn){
        $.each(this.model._data, fn);
      },
      
      // Persistence: save
      save: function(){},
  
      // Persistence: load
      load: function(){},
      
      // Persistence: erase
      erase: function(){}      
      
    }, // model prototype
  
    // -------------
    //
    //  View
    //
    // -------------
  
    view: {
        
      // Defaults
      template: '<div data-bind="text"></div>',
      style: '',
      
      // Shortcut to view.$root or view.$root.find(), depending on selector presence
      $: function(selector){
        return (!selector || selector === ROOT_SELECTOR) ? this.view.$root : this.view.$root.find(selector);
      },
      
      // Render $root
      render: function(){
        // Without template there is no view
        if (this.view.template.length === 0) {
          throw "agility.js: empty template in view.render()";
        }                
        if (this.view.$root.size() === 0) {
          this.view.$root = $(this.view.template);
        }
        else {
          this.view.$root.html( $(this.view.template).html() ); // can't overwrite $root as this would reset its presence in the DOM and all events already bound, and 
        }
        // Ensure we have a valid (non-empty) $root
        if (this.view.$root.size() === 0) {
          throw 'agility.js: could not generate html from template';
        }
      }, // render
  
      // Apply two-way (DOM <--> Model) bindings to elements with 'data-bind' attributes
      bindings: function(){
        var self = this;
        var $rootNode = this.view.$().filter('[data-bind]');
        var $childNodes = this.view.$('[data-bind]');
        $rootNode.add($childNodes).each(function(){
          var $this = $(this);
          var modelKey = $this.data('bind');
          var $node = $this;

          // <input>: 2-way binding
          if ($this.is('input')) {
          }
          // <a>: 1-way binding to [href]
          else if ($this.is('a')) {
            self.bind('modelChange:'+modelKey, function(){
              $node.attr('href', self.model.get(modelKey));
            });
          }
          // <img>: 1-way binding to [src]
          else if ($this.is('img')) {
            self.bind('modelChange:'+modelKey, function(){
              $node.attr('src', self.model.get(modelKey));
            });
          }
          // <div>, <span>, and all other elements: 1-way binding to .html()
          else {
            self.bind('modelChange:'+modelKey, function(){
              $node.html(self.model.get(modelKey));
            });
          }
        });        
      },
      
      // Triggers modelChange and modelChange:* events so that view is updated as per view.bindings()
      refresh: function(){
        var self = this;
        // Trigger modelChange events so that view is updated according to model
        this.model.each(function(key, val){
          self.trigger('modelChange:'+key);
        });
        if (this.model.size() > 0) {
          this.trigger('modelChange');
        }
      },

      // Applies style dynamically
      stylize: function(){
        var objClass,
            regex = new RegExp(ROOT_SELECTOR, 'g');
        if (this.view.style.length === 0 || this.view.$root.size() === 0) {
          return;
        }
        // Own style
        // Object gets own class name ".agility_123", and <head> gets a corresponding <style>
        if (this.view.hasOwnProperty('style')) {
          objClass = 'agility_' + this._id;
          var styleStr = this.view.style.replace(regex, '.'+objClass);
          $('head', window.document).append('<style type="text/css">'+styleStr+'</style>');
          this.view.$root.addClass(objClass);
        }
        // Inherited style
        // Object inherits CSS class name from first ancestor to have own view.style
        else {
          // Returns id of first ancestor to have 'own' view.style
          var ancestorWithStyle = function(object) {
            while (object !== null) {
              object = Object.getPrototypeOf(object);
              if (object.view.hasOwnProperty('style'))
                return object._id;
            }
            return undefined;
          }; // ancestorWithStyle
          
          var ancestorId = ancestorWithStyle(this);
          objClass = 'agility_' + ancestorId;
          this.view.$root.addClass(objClass);
        }
      },
      
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
  
      // Triggered after self creation
      _create: function(event){
        this.view.stylize();
        this.view.bindings(); // Model-View bindings
        this.view.refresh(); // syncs View with Model
      },
  
      // Triggered upon removing self
      _remove: function(event){
        this.view.remove();
        this.model.erase();
      },

      // Triggered after model is changed
      _modelChange: function(event){
      },

      // Triggered after child obj is added to tree
      _treeAdd: function(event, obj, selector){
        this.view.append(obj.view.$root, selector);
      },
                  
      // Triggered after a child obj is removed from tree (or self-removed)
      _treeRemove: function(event, id){        
      }
      
    }, // controller prototype

    // -------------
    //
    //  Tree
    //
    // -------------
    
    tree: {

      // Adds child object to tree, listens for child removal
      add: function(obj, selector){
        var self = this;
        if (!util.isAgility(obj)) {
          throw "agility.js: add argument is not an agility object";
        }
        this.tree.children[obj._id] = obj;
        this.trigger('treeAdd', [obj, selector]);
        obj.bind('remove', function(event, id){ 
          self.tree.remove(id);
        });
        return this;
      },
      
      // Removes child object from tree
      remove: function(id){
        delete this.tree.children[id];
        this.trigger('treeRemove', id);
      },
      
      // Number of children
      size: function() {
        return util.size(this.tree.children);
      }
      
    },

    // -------------
    //
    //  Shortcuts
    //
    // -------------
        
    //
    // Tree shortcuts
    //
    add: function(){      
      this.tree.add.apply(this, arguments);
      return this; // for chainable calls
    },
    // Hybrid shortcut: removes self or tree element, depending on argument presence
    remove: function(args){
      if (!args) {
        this.trigger('remove', this._id); // parent must listen to 'remove' event and handle tree removal!
        // can't return this as it might not exist anymore!
      } 
      else {
        this.tree.remove.apply(this, arguments);
        return this;
      }
    },

    //
    // _Events shortcuts
    //
    bind: function(){
      this._events.bind.apply(this, arguments);
      return this; // for chainable calls
    },
    trigger: function(){
      this._events.trigger.apply(this, arguments);
      return this; // for chainable calls
    },
    
    //
    // Model shortcuts
    //
    set: function(){
      this.model.set.apply(this, arguments);
      return this; // for chainable calls
    }, // set
    get: function(){
      return this.model.get.apply(this, arguments);    
      // can't do chainable here!
    }
  
  }; // prototype
  
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
            
    // -----------------------------------------
    //
    //  Define object prototype
    //
    // -----------------------------------------

    // Inherit object prototype
    if (typeof args[0] === "object" && util.isAgility(args[0])) {
      prototype = args[0];
      args.shift(); // remaining args now work as though object wasn't specified
    } // build from agility object
    
    // Build object from prototype as well as the individual prototype parts
    // This enables differential inheritance at the sub-object level, e.g. object.view.template
    object = Object.create(prototype);
    object.model = Object.create(prototype.model);
    object.view = Object.create(prototype.view);
    object.controller = Object.create(prototype.controller);
    object.tree = Object.create(prototype.tree);
    object._events = Object.create(prototype._events);

    // Fresh 'own' properties (i.e. properties that are not inherited at all)
    object._id = idCounter++;
    object._events.data = {}; // event bindings will happen below
    object.tree.children = {};
    object.view.$root = $(); // empty jQuery object

    // Cloned own properties (i.e. properties that are inherited by direct copy instead of by prototype chain)
    object.model._data = object.model._data ? $.extend({}, object.model._data) : {};

    // -----------------------------------------
    //
    //  Extend model, view, controller
    //
    // -----------------------------------------

    // Just the default prototype
    if (args.length === 0) {
    }
  
    // Prototype differential from single {model,view,controller} object
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
    
    // Prototype differential from separate {model}, {view}, {controller} arguments
    else {
      
      // Model from string
      if (typeof args[0] === 'string') {
        $.extend(object.model._data, {text: args[0]});
      }
      else if (typeof args[0] === 'object') {
        $.extend(object.model._data, args[0]);
      }
      else if (args[0]) {
        throw "agility.js: unknown argument type (model)";
      }

      // View template from shorthand string (..., '<div>${whatever}</div>', ...)
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
      
      // View style from shorthand string (..., ..., 'p {color:red}', ...)
      if (typeof args[2] === 'string') {
        object.view.style = args[2];
        args.splice(2, 1); // so that controller code below works
      }
      
      // Controller from object (..., ..., {method():function(){}})
      if (typeof args[2] === 'object') {
        $.extend(object.controller, args[2]);
      }
      else if (args[2]) {
        throw "agility.js: unknown argument type (controller)";
      }
      
    } // ({model}, {view}, {controller}) args
    
    // ----------------------------------------------
    //
    //  Bootstrap: Bindings, initializations, etc
    //
    // ----------------------------------------------
  
    // object.* will have their 'this' === object. This should come before call to object.* below.
    util.proxyAll(object, object);

    // Initialize $root, needed for DOM events binding below
    object.view.render();
  
    // Binds all existing controller functions to corresponding events
    for (var ev in object.controller) {
      if (typeof object.controller[ev] === 'function') {
        object.bind(ev, object.controller[ev]);
      }
    }
  
    // Auto-triggers create event
    object.trigger('create');
    
    return object;
    
  }; // agility
  
  // -----------------------------------------
  //
  //  Global objects
  //
  // -----------------------------------------
  
  agility.document = agility({}, {}, {
    create: function(){
      this.view.$root = $(document.body);
    }
  });

  // Globals
  window.agility = window.$$ = agility;
    
})(window);
