/*

  Agility.js    
  Licensed under the MIT license
  Copyright (c) Artur B. Adib, 2011
  http://agilityjs.com

*/

// Sandboxed, so kids don't get hurt. Inspired by jQuery's code:
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

  // Modified from Douglas Crockford's Object.create()
  // The condition below ensures we override other manual implementations (most are not adequate)
  if (!Object.create || Object.create.toString().search(/native code/i)<0) {
    Object.create = function(obj){
      var Aux = function(){};
      $.extend(Aux.prototype, obj); // simply setting Aux.prototype = obj somehow messes with constructor, so getPrototypeOf wouldn't work in IE
      return new Aux();
    };
  }
  
  // Modified from John Resig's Object.getPrototypeOf()
  // The condition below ensures we override other manual implementations (most are not adequate)
  if (!Object.getPrototypeOf || Object.getPrototypeOf.toString().search(/native code/i)<0) {
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

  // Modified from  eligrey's Object.watch() shim
  // Object.unwatch is not included since I'll watch model for the 
  if (!Object.prototype.watch || Object.getPrototypeOf.toString().search(/native code/i)<0) {
    Object.prototype.watch = function (prop, handler) {
      var oldval = this[prop], newval = oldval,
        getter = function () {
          return newval;
      },
      setter = function (val) {
        oldval = newval;
        return newval = handler.call(this, prop, oldval, val);
      };
      if (delete this[prop]) { // can't watch constants
        if (Object.defineProperty) { // ECMAScript 5
          Object.defineProperty(this, prop, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
        });
        } else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
          Object.prototype.__defineGetter__.call(this, prop, getter);
          Object.prototype.__defineSetter__.call(this, prop, setter);
        }
      }
    };
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
    //  _Container
    //
    // -------------
    
    _container: {

      // Adds child object to container, appends view, listens for child removal
      append: function(obj, selector){
        var self = this;
        if (!util.isAgility(obj)) {
          throw "agility.js: append argument is not an agility object";
        }
        this._container.children[obj._id] = obj; // children is *not* an array; this is for simpler lookups by global object id
        this.trigger('append', [obj, selector]);
        // ensures object is removed from container when destroyed:
        obj.bind('destroy', function(event, id){ 
          self._container.remove(id);
        });
        return this;
      },

      // Adds child object to container, prepends view, listens for child removal
      prepend: function(obj, selector){
        var self = this;
        if (!util.isAgility(obj)) {
          throw "agility.js: prepend argument is not an agility object";
        }
        this._container.children[obj._id] = obj; // children is *not* an array; this is for simpler lookups by global object id
        this.trigger('prepend', [obj, selector]);
        // ensures object is removed from container when destroyed:
        obj.bind('destroy', function(event, id){ 
          self._container.remove(id);
        });
        return this;
      },
      
      // Removes child object from container
      remove: function(id){
        delete this._container.children[id];
        this.trigger('remove', id);
        return this;
      },

      // Iterates over all child objects in container
      each: function(fn){
        $.each(this._container.children, fn);
        return this; // for chainable calls
      },
      
      // Removes all objects in container
      empty: function(){
        this.each(function(){
          this.destroy();
        });
        return this;
      },
      
      // Number of children
      size: function() {
        return util.size(this._container.children);
      }
      
    },

    // -------------
    //
    //  _Events
    //
    // -------------
    
    _events: {

      // Parses event string like:
      //    'event'          : custom event
      //    'event selector' : DOM event using 'selector'
      // Returns { type:'event' [, selector:'selector'] }
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
            this.view.$().bind(eventObj.type, fn);
          }
          else {          
            this.view.$().delegate(eventObj.selector, eventObj.type, fn);
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
            this.view.$().trigger(eventObj.type, params);
          }
          else {          
            this.view.$().find(eventObj.selector).trigger(eventObj.type, params);
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
       
    model: {}, // model prototype, empty now that watch is used, if brought back to root, backwords compatibility will need to be added
  
    // -------------
    //
    //  View
    //
    // -------------
  
    view: {
        
      // Defaults
      format: '<div data-bind="text"></div>',
      style: '',
      
      // Shortcut to view.$root or view.$root.find(), depending on selector presence
      $: function(selector){
        return (!selector || selector === ROOT_SELECTOR) ? this.view.$root : this.view.$root.find(selector);
      },
      
      // Render $root
      // Only function to access $root directly other than $()
      render: function(){
        // Without format there is no view
        if (this.view.format.length === 0) {
          throw "agility.js: empty format in view.render()";
        }
        //preprocess format
        if (!this.view.raw) {
          this.view.format, this.view.template_compiled = this.view.template(this.view.format, this.model);
          this.view.raw = true;
        }
        if (typeof this.view.template_compiled === 'function') {
          this.view.format = this.view.template_compiled(this.model);
        }
              
        if (this.view.$root.size() === 0) {
          this.view.$root = $(this.view.format);
        }
        else {
          this.view.$root.html( $(this.view.format).html() ); // can't overwrite $root as this would reset its presence in the DOM and all events already bound, and 
        }
        // Ensure we have a valid (non-empty) $root
        if (this.view.$root.size() === 0) {
          throw 'agility.js: could not generate html from format';
        }
        return this;
      }, // render
  
      // Parse data-bind string of the type '[attribute] variable'
      // Returns { key:'model key' [, attr:'attribute'] }
      _parseBindStr: function(str){
        var obj = { key:str }, 
            spacePos = str.search(/\s/);
        if (spacePos > -1) {
          obj.attr = str.substr(0, spacePos);
          obj.key = str.substr(spacePos+1);
        }
        return obj;
      },
      
      // Apply two-way (DOM <--> Model) bindings to elements with 'data-bind' attributes
      bindings: function(){
        var self = this;
        var $rootNode = this.view.$().filter('[data-bind]');
        var $childNodes = this.view.$('[data-bind]');
        $rootNode.add($childNodes).each(function(){
          var $node = $(this);
          var bindData = self.view._parseBindStr( $node.data('bind') );

          // <input type="checkbox">: 2-way binding
          if ($node.is('input[type="checkbox"]')) {
            // Model --> DOM
            self.bind('_change:'+bindData.key, function(){
              $node.prop("checked", self.model[bindData.key]); // this won't fire a DOM 'change' event, saving us from an infinite event loop (Model <--> DOM)
            });            
            // DOM --> Model
            $node.change(function(){
              self.model[bindData.key] = $(this).prop("checked"); // not silent as user might be listening to change events
            });
          }
          
          // <select>: 2-way binding
          else if ($node.is('select')) {
            // Model --> DOM
            self.bind('_change:'+bindData.key, function(){
              var nodeName = $node.attr('name');
              var modelValue = self.model[bindData.key];
              $node.val(modelValue);
            });            
            // DOM --> Model
            $node.change(function(){
              self.model[bindData.key] = $node.val(); // not silent as user might be listening to change events
            });
          }
          
          // <input type="radio">: 2-way binding
          else if ($node.is('input[type="radio"]')) {
            // Model --> DOM
            self.bind('_change:'+bindData.key, function(){
              var nodeName = $node.attr('name');
              var modelValue = self.model[bindData.key];
              $node.siblings('input[name="'+nodeName+'"]').filter('[value="'+modelValue+'"]').prop("checked", true); // this won't fire a DOM 'change' event, saving us from an infinite event loop (Model <--> DOM)
            });            
            // DOM --> Model
            $node.change(function(){
              if (!$node.prop("checked")) return; // only handles check=true events
              self.model[bindData.key] = $node.val(); // not silent as user might be listening to change events
            });
          }
          
          // <input type="search"> (model is updated after every keypress event)
          else if ($node.is('input[type="search"]')) {
            // Model --> DOM
            self.bind('_change:'+bindData.key, function(){
              $node.val(self.model[bindData.key]); // this won't fire a DOM 'change' event, saving us from an infinite event loop (Model <--> DOM)
            });
            // Model <-- DOM
            $node.keypress(function(){
              // Without timeout $node.val() misses the last entered character
              setTimeout(function(){
                self.model[bindData.key] = $node.val(); // not silent as user might be listening to change events
              }, 50);
            });
          }

          // <input type="text"> and <textarea>: 2-way binding
          else if ($node.is('input[type="text"], textarea')) {
            // Model --> DOM
            self.bind('_change:'+bindData.key, function(){
              $node.val(self.model[bindData.key]); // this won't fire a DOM 'change' event, saving us from an infinite event loop (Model <--> DOM)
            });            
            // Model <-- DOM
            $node.change(function(){
              self.model[bindData.key] = $(this).val(); // not silent as user might be listening to change events
            });
          }
          
          // all other <tag>s: 1-way binding
          else {
            if (bindData.attr) {
              self.bind('_change:'+bindData.key, function(){
                $node.attr(bindData.attr, self.model[bindData.key]);
              });
            }
            else {
              self.bind('_change:'+bindData.key, function(){
                $node.text(self.model[bindData.key].toString());
              });
            }
          }
        }); // nodes.each()
        return this;
      }, // bindings()

      // Applies style dynamically
      stylize: function(){
        var objClass,
            regex = new RegExp(ROOT_SELECTOR, 'g');
        if (this.view.style.length === 0 || this.view.$().size() === 0) {
          return;
        }
        // Own style
        // Object gets own class name ".agility_123", and <head> gets a corresponding <style>
        if (this.view.hasOwnProperty('style')) {
          objClass = 'agility_' + this._id;
          var styleStr = this.view.style.replace(regex, '.'+objClass);
          $('head', window.document).append('<style type="text/css">'+styleStr+'</style>');
          this.view.$().addClass(objClass);
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
          this.view.$().addClass(objClass);
        }
        return this;
      },

      // templating hooks
      template : function(data) {return data},
      raw : true
      
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

        Object.watch(this.model, function(attr, value) {
          this.trigger('change:'+attr);
          this.trigger('change');
          return value;
        });
      },
  
      // Triggered upon removing self
      _destroy: function(event){
        this.view.$().remove();
      },

      // Triggered after child obj is appended to container
      _append: function(event, obj, selector){
        this.view.$(selector).append(obj.view.$());
      },

      // Triggered after child obj is prepended to container
      _prepend: function(event, obj, selector){
        this.view.$(selector).prepend(obj.view.$());
      },
                  
      // Triggered after a child obj is removed from container (or self-removed)
      _remove: function(event, id){        
      },

      // Triggered after model is changed
      '_change': function(event){
      }
      
    }, // controller prototype

    // -------------
    //
    //  Shortcuts
    //
    // -------------
        
    //
    // Self
    //    
    destroy: function() {
      this.trigger('destroy', this._id); // parent must listen to 'remove' event and handle container removal!
      // can't return this as it might not exist anymore!
    },
    
    //
    // _Container shortcuts
    //
    append: function(){
      this._container.append.apply(this, arguments);
      return this; // for chainable calls
    },
    prepend: function(){
      this._container.prepend.apply(this, arguments);
      return this; // for chainable calls
    },
    remove: function(){
      this._container.remove.apply(this, arguments);
      return this; // for chainable calls
    },
    size: function(){
      return this._container.size.apply(this, arguments);
    },
    each: function(){
      return this._container.each.apply(this, arguments);
    },
    empty: function(){
      return this._container.empty.apply(this, arguments);
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
    // This enables differential inheritance at the sub-object level, e.g. object.view.format
    object = Object.create(prototype);
    object.model = Object.create(prototype.model);
    object.view = Object.create(prototype.view);
    object.controller = Object.create(prototype.controller);
    object._container = Object.create(prototype._container);
    object._events = Object.create(prototype._events);

    // Fresh 'own' properties (i.e. properties that are not inherited at all)
    object._id = idCounter++;
    object._data = {};
    object._events.data = {}; // event bindings will happen below
    object._container.children = {};
    object.view.$root = $(); // empty jQuery object

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
      for (var prop in args[0]) {
        if (prop === 'model') {
          $.extend(object.model, args[0][prop]);
        }
        else if (prop === 'view') {
          $.extend(object.view, args[0][prop]);
        }
        else if (prop === 'controller') {
          $.extend(object.controller, args[0][prop]);
        }
        // User-defined methods
        else {
          object[prop] = args[0][prop];
        }
      }
    } // {model, view, controller} arg
    
    // Prototype differential from separate {model}, {view}, {controller} arguments
    else {
      if (typeof args[0] === 'object') {
        $.extend(object.model, args[0]);
      }
      else if (args[0]) {
        throw "agility.js: unknown argument type (model)";
      }

      // View format from shorthand string (..., '<div>whatever</div>', ...)
      if (typeof args[1] === 'string') {
        object.view.format = args[1]; // extend view with .format
      }  
      // View from object (..., {format:'<div>whatever</div>'}, ...)
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
      
      // Controller from object (..., ..., {method:function(){}})
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
  
  agility.document = agility({
    view: {
      $: function(selector){ return selector ? $(selector, 'body') : $('body'); }
    },
    controller: {
      // Override default controller
      // (don't render, don't stylize, etc)
      _create: function(){}
    }
  });
  
  // For plugins
  agility.fn = defaultPrototype;

  // Globals
  window.agility = window.$$ = agility;



  // -----------------------------------------
  //
  //  Bundled plugin: persist
  //
  // -----------------------------------------
  
  // Main initializer
  agility.fn.persist = function(adapter, params){
    var self = this,
        id = 'id'; // name of id attribute
        
    self._data.persist = $.extend({adapter:adapter}, params);
    self._data.persist.openRequests = 0;
    if (params && params.id) {
      id = params.id;
    }

    // Creates persist methods
    
    // .save()
    // Creates new model or update existing one, depending on whether model has 'id' property
    this.save = function(){
      if (self._data.persist.openRequests === 0) {
        self.trigger('persist:start');
      }
      self._data.persist.openRequests++;
      self._data.persist.adapter.call(self, {
        type: self.model[id] ? 'PUT' : 'POST', // update vs. create
        id: self.model[id],
        data: self.model,
        complete: function(){
          self._data.persist.openRequests--;
          if (self._data.persist.openRequests === 0) {
            self.trigger('persist:stop');
          }
        },
        success: function(data, textStatus, jqXHR){
          if (data[id]) {
            // id in body
            self.model[id] = data[id]; self.model.silent = true;
          }
          else if (jqXHR.getResponseHeader('Location')) {
            // parse id from Location
            self.model[id] = jqXHR.getResponseHeader('Location').match(/\/([0-9]+)$/)[1]; this.model.silent = true;
          }
          self.trigger('persist:save:success');
        },
        error: function(){
          self.trigger('persist:error');
          self.trigger('persist:save:error');
        }
      });
      
      return this; // for chainable calls
    }; // save()
  
    // .load()
    // Loads model with given id
    this.load = function(){
      if (this.model[id] === undefined) throw 'agility.js: load() needs model id';
    
      if (self._data.persist.openRequests === 0) {
        self.trigger('persist:start');
      }
      self._data.persist.openRequests++;
      self._data.persist.adapter.call(self, {
        type: 'GET',
        id: this.model[id],
        complete: function(){
          self._data.persist.openRequests--;
          if (self._data.persist.openRequests === 0) {
            self.trigger('persist:stop');
          }
        },
        success: function(data, textStatus, jqXHR){
          $.extend(self.model, data);
          self.trigger('persist:load:success');
        },      
        error: function(){
          self.trigger('persist:error');
          self.trigger('persist:load:error');
        }
      });      

      return this; // for chainable calls
    }; // load()

    // .erase()
    // Erases model with given id
    this.erase = function(){
      if (this.model[id] === undefined) throw 'agility.js: erase() needs model id';
    
      if (self._data.persist.openRequests === 0) {
        self.trigger('persist:start');
      }
      self._data.persist.openRequests++;
      self._data.persist.adapter.call(self, {
        type: 'DELETE',
        id: this.model[id],
        complete: function(){
          self._data.persist.openRequests--;
          if (self._data.persist.openRequests === 0) {
            self.trigger('persist:stop');
          }
        },
        success: function(data, textStatus, jqXHR){
          self.destroy();
          self.trigger('persist:erase:success');
        },      
        error: function(){
          self.trigger('persist:error');
          self.trigger('persist:erase:error');
        }
      });            

      return this; // for chainable calls
    }; // erase()

    // .gather()
    // Loads collection and appends/prepends (depending on method) at selector. All persistence data including adapter comes from proto, not self
    this.gather = function(proto, method, selectorOrQuery, query){
      var selector;
      if (!proto) throw "agility.js plugin persist: gather() needs object prototype";
      if (!proto._data.persist) throw "agility.js plugin persist: prototype doesn't seem to contain persist() data";

      // Determines arguments
      if (query) {
        selector = selectorOrQuery;        
      }
      else {
        if (typeof selectorOrQuery === 'string') {
          selector = selectorOrQuery;
        }
        else {
          selector = undefined;
          query = selectorOrQuery;
        }
      }

      if (self._data.persist.openRequests === 0) {
        self.trigger('persist:start');
      }
      self._data.persist.openRequests++;
      proto._data.persist.adapter.call(proto, {
        type: 'GET',
        data: query,
        complete: function(){
          self._data.persist.openRequests--;
          if (self._data.persist.openRequests === 0) {
            self.trigger('persist:stop');
          }
        },
        success: function(data){
          $.each(data, function(index, entry){
            var obj = $$(proto, entry);
            if (typeof method === 'string') {
              self[method](obj, selector);
            }
          });
          self.trigger('persist:gather:success', {data:data});
        },
        error: function(){
          self.trigger('persist:error');
          self.trigger('persist:gather:error');
        }
      });
    
      return this; // for chainable calls
    };

    return this; // for chainable calls
  };
  
  // Persistence adapters
  // These are functions. Required parameters:
  //    {type: 'GET' || 'POST' || 'PUT' || 'DELETE'}
  agility.adapter = {};

  // RESTful JSON adapter using jQuery's ajax()
  agility.adapter.restful = function(_params){
    var params = $.extend({
      dataType: 'json',
      url: (this._data.persist.baseUrl || 'api/') + this._data.persist.collection + (_params.id ? '/'+_params.id : '')
    }, _params);
    $.ajax(params);
  };
  
})(window);
