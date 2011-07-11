// Sandboxed, so kids don't get hurt. Inspired by jQuery's code.
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
    //  _Container
    //
    // -------------
    
    _container: {

      // Adds child object to container, listens for child removal
      add: function(obj, selector){
        var self = this;
        if (!util.isAgility(obj)) {
          throw "agility.js: add argument is not an agility object";
        }
        this._container.children[obj._id] = obj;
        this.trigger('add', [obj, selector]);
        obj.bind('destroy', function(event, id){ 
          self._container.remove(id);
        });
        return this;
      },
      
      // Removes child object from container
      remove: function(id){
        delete this._container.children[id];
        this.trigger('remove', id);
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
          if (params && params.reset) {
            this.model._data = arg; // erases previous model attributes
          }
          else {
            $.extend(this.model._data, arg); // default is extend
          }
          for (var key in arg) {
            modified.push(key);
          }
        }
        else {
          throw "agility.js: unknown argument type in model.set()";
        }

        // Events
        if (params && params.silent===true) return this; // do not fire events
        this.trigger('change');
        $.each(modified, function(index, val){
          self.trigger('change:'+val);
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
      }
      
    }, // model prototype
  
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
      render: function(){
        // Without format there is no view
        if (this.view.format.length === 0) {
          throw "agility.js: empty format in view.render()";
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
      }, // render
  
      // Parse data-bind string of the type 'variable [attribute]'
      // Returns { key:'model key' [, attr:'attribute'] }
      _parseBindStr: function(str){
        var obj = { key:str }, 
            spacePos = str.search(/\s/);
        if (spacePos > -1) {
          obj.key = str.substr(0, spacePos);
          obj.attr = str.substr(spacePos+1);
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
              $node.prop("checked", self.model.get(bindData.key)); // this won't fire a DOM 'change' event, saving us from an infinite event loop (Model <--> DOM)
            });            
            // DOM --> Model
            $node.change(function(){
              var obj = {};
              obj[bindData.key] = $(this).prop("checked");
              self.model.set(obj); // not silent as user might be listening to change events
            });
          }
          
          // <select>: 2-way binding
          else if ($node.is('select')) {
            // Model --> DOM
            self.bind('_change:'+bindData.key, function(){
              var nodeName = $node.attr('name');
              var modelValue = self.model.get(bindData.key);
              $node.val(modelValue);
            });            
            // DOM --> Model
            $node.change(function(){
              var obj = {};
              obj[bindData.key] = $node.val();
              self.model.set(obj); // not silent as user might be listening to change events
            });
          }
          
          // <input type="radio">: 2-way binding
          else if ($node.is('input[type="radio"]')) {
            // Model --> DOM
            self.bind('_change:'+bindData.key, function(){
              var nodeName = $node.attr('name');
              var modelValue = self.model.get(bindData.key);
              $node.siblings('input[name="'+nodeName+'"]').filter('[value="'+modelValue+'"]').prop("checked", true); // this won't fire a DOM 'change' event, saving us from an infinite event loop (Model <--> DOM)
            });            
            // DOM --> Model
            $node.change(function(){
              if (!$node.prop("checked")) return; // only handles check=true events
              var obj = {};
              obj[bindData.key] = $node.val();
              self.model.set(obj); // not silent as user might be listening to change events
            });
          }
          
          // <input type="text"> and <textarea>: 2-way binding
          else if ($node.is('input[type="text"], textarea')) {
            // Model --> DOM
            self.bind('_change:'+bindData.key, function(){
              $node.val(self.model.get(bindData.key)); // this won't fire a DOM 'change' event, saving us from an infinite event loop (Model <--> DOM)
            });            
            // Model <-- DOM
            $node.change(function(){
              var obj = {};
              obj[bindData.key] = $(this).val();
              self.model.set(obj); // not silent as user might be listening to change events
            });
          }
          
          // all other <tag>s: 1-way binding
          else {
            if (bindData.attr) {
              self.bind('_change:'+bindData.key, function(){
                $node.attr(bindData.attr, self.model.get(bindData.key));
              });
            }
            else {
              self.bind('_change:'+bindData.key, function(){
                $node.text(self.model.get(bindData.key).toString());
              });
            }
          }
        }); // nodes.each()
      }, // bindings()
      
      // Triggers _change and _change:* events so that view is updated as per view.bindings()
      refresh: function(){
        var self = this;
        // Trigger change events so that view is updated according to model
        this.model.each(function(key, val){
          self.trigger('_change:'+key);
        });
        if (this.model.size() > 0) {
          this.trigger('_change');
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
      destroy: function(){
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
      _destroy: function(event){
        this.view.destroy();
      },

      // Triggered after child obj is added to container
      _add: function(event, obj, selector){
        this.view.append(obj.view.$root, selector);
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
    add: function(){      
      this._container.add.apply(this, arguments);
      return this; // for chainable calls
    },
    remove: function(){
      this._container.remove.apply(this, arguments);
      return this; // for chainable calls
    },
    size: function(){
      return this._container.size.apply(this, arguments);
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
    if (!adapter || !params) throw "agility.js plugin persist: missing argument";
    this._data.persist = $.extend({adapter:adapter}, params);    
    return this; // for chainable calls
  };
  
  agility.fn.save = function(){};
  
  agility.fn.load = function(){};

  agility.fn.erase = function(){};

  // Loads collection and appends at selector
  // All persistence data including adapter comes from proto, not self
  agility.fn.gather = function(proto, selector, params){
    if (!proto) throw "agility.js plugin persist: gather() needs object prototype";
    if (!proto._data.persist) throw "agility.js plugin persist: prototype doesn't seem to contain persist() data";
    var self = this, result;

    self.trigger('persist:start');
    self.trigger('persist:gather:start');
    result = proto._data.persist.adapter.call(proto, {
      type: 'GET',
      complete: function(){
        self.trigger('persist:end');
        self.trigger('persist:gather:end');
      },
      success: function(data){
        $.each(data, function(index, entry){
          var obj = $$(proto, entry);
          self.add(obj, selector);
        })
        self.trigger('persist:success', {data:data});
        self.trigger('persist:gather:success', {data:data});
      },
      error: function(){
        self.trigger('persist:error');
        self.trigger('persist:gather:error');
      }
    });
    
    return result;
  };

  // Persistence adapters
  // These are functions. Required parameters:
  //    {type: 'GET' || 'POST' || 'UPDATE' || 'DELETE'}
  agility.adapter = {};

  // RESTful JSON adapter using jQuery's ajax()
  agility.adapter.restful = function(_params){
    var self = this; // agility object called from
    var params = $.extend({
      url: (self._data.persist.baseUrl || '/api/') + self._data.persist.collection,
    }, _params);
    return $.ajax(params);
  };

  
})(window);
