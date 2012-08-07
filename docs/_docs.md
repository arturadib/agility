
<p class='download'><b>Version: __VERSION__</b></p>

# [Introduction](#intro) 

Agility is a [Model-View-Controller](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) (MVC) library for client-side Javascript with some specific design principles:

+ Convention over configuration (CoC);
+ Don't repeat yourself (DRY); and
+ Full object reusability.

The overall goal is to improve code maintainability without sacrificing productivity. It is inspired by the principles behind [Ruby on Rails](http://en.wikipedia.org/wiki/Ruby_on_Rails) and [jQuery](http://www.jquery.com).

Agility's programming model is framed around the concept of self-contained MVC objects, where each object can be the prototype of, as well as the container of other MVC objects. This level of abstraction should encompass most applications.

See the [home page](/) for a quick overview of its syntax and usage.

## [Why MVC?](#intro-mvc)

One might wonder, since DOM-querying/Ajax libraries like jQuery make it so easy to whip up a dynamic web app, why bother with an additional layer of complexity?

### [Short answer](#intro-mvc-quick)

For those who have built a complex web app "organically", i.e. purely through DOM querying and manual Ajax calls, the answer is immediate: although you were able to get that app up to speed so quickly, you probably dread maintaining and relearning that intertwined code, and wish you had known better!

### [Long answer](#intro-mvc-long)

For those who haven't, some things you will likely end up doing with a pure jQuery-esque solution include: storing data in the DOM; querying the DOM to find your data; defining global callbacks to DOM events e.g. click/input change; having those callbacks neatly package your data to be sent to the server; retrieving data from the server and inserting them in the DOM with the right format and event handlers; etc.

Though that's all fine initially, sooner or later you will start running into maintainability problems: storing data in the DOM is very brittle, e.g. changing an id/class or restructuring the DOM requires revisiting the code just about everywhere; DOM elements that are logically related and need to be always in sync require manual updates in all callbacks associated with them; global callbacks lead to name collisions and hence cumbersome function names, as well as difficulties in finding just what function is responsible for doing X or Y; defining functions that package data for, or present data after Ajax calls is unnecessarily repetitive; etc.

One established answer to these problems is the [Model-View-Controller](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) approach, where your app is organized in "large" objects each having different parts responsible for managing content (Model), format/style (View), and behavior (Controller). For example, a series of DOM input elements such as Name, Address, Phone, etc, related to the abstract concept of "person" become part of an object "person", whose model contains the raw data, view contains the HTML/CSS presentation, and controller contains the actions that will be called in response to events in the former two.

MVC libraries like Agility typically offer built-in model, view, and controller methods that encompass most use case scenarios, so you don't have to reinvent the wheel or repeat yourself. That way all functions, formatting, and data related to an abstract concept (e.g. "person") are all in one place, the DOM is always in sync with the data, and the data is always ready to be sent to/retrieved from the server in one call.

## [Why Agility?](#intro-agility)

In response to the difficulties above, in the last few years [several](http://www.sproutcore.com/) [superb](http://documentcloud.github.com/backbone/) [libraries](http://knockoutjs.com/) have been introduced to bring MVC (or a variant thereof) to the browser. Although they do a good job of refactoring apps in terms of content, format, and behavior - and hence lead to more maintainable code - they do so at the expense of development speed: Most are fairly verbose, require a considerable amount of repetition, and/or require large library includes.

Agility borrows some useful concepts from the above frameworks, and makes rapid development a core part of its design principles. It's ["write less, do more"](http://www.jquery.com) with maintainability, if you will.

### [Features](#intro-features)

Here are some of the features that Agility.js has aggregated into a single framework:

+ Painless [two-way model-view bindings](#bindings);
+ Implicit [controller-event bindings](#events);
+ [Controller auto-proxying](#auto-proxy) for quick and consistent access to owner object;
+ [Format and style in-object](#format-style) for "copy-and-paste" reusability;
+ Small (<10K) single-library include;
+ Compact and efficient [syntax](#factory), inspired by jQuery;
+ Pure [prototypal inheritance](#inheritance);
+ [Strict MVC](#intro-architecture): core has no additional concepts other than M, V, and C.

## [Architecture](#intro-architecture)

Agility's architecture follows one of the simplest MVC patterns: users define Controller functions, which make direct calls to, and handle events from Models and Views. The diagram below illustrates this.

![Architecture diagram](architecture.png)

So for example, when a user clicks on a DOM element, an event signal is sent from the View to any Controller functions listening to it, and these functions in turn can make direct calls to Model and View functions.

Additionally, as illustrated below, every Agility object can serve as a container of other Agility objects. This is a natural abstraction for most applications, including simple lists, interactive tables, picture/video catalogs, etc, where each individual item might contain enough functionality (e.g. edit/remove buttons, mouse hover behavior, etc) to deserve its own MVC object. And because Agility objects are lightweight in memory (through pervasive use of prototypes), this comes at little performance cost.

![Hierarchy diagram](container.png)

# [Getting started](#getting-started)

Agility.js depends on a recent version of jQuery (tested with 1.6.x, Zepto support coming soon). Other than that dependency, a single `<script>` tag in your Javascript code is all that's required, e.g.:
  
    :::html
    <script src="agility.js" type="text/javascript" charset="utf-8"></script>

Typically the `<body>` of your HTML will be empty, and will be populated programmatically by adding Agility objects to the [global object](#globals-document) `$$.document`.

Here's the full source of a "hello world" example:

    :::html
    <!DOCTYPE html>
    <html>

    <head>
      <meta http-equiv="Content-type" content="text/html; charset=utf-8">
      <title>Agility Hello World</title>

      <script src="jquery.min.js" type="text/javascript" charset="utf-8"></script>
      <script src="agility.js" type="text/javascript" charset="utf-8"></script>
    </head>

    <body>
      <script type="text/javascript">
        var message = $$({txt:'Hello World'}, '<div data-bind="txt"/>');
        $$.document.append(message);        
      </script>
    </body>

    </html>

The above template has been used for all examples throughout this documentation.

## [Creating objects](#creating-objects)

Agility is framed around the notion of all-in-one MVC objects, or simply "Agility objects". Such objects are created through the [factory function](#factory) `$$()`, either from scratch (by passing model, view, and/or controller initializers) or from a prototype object (by specifying an existing Agility object):

    :::javascript
    // Create object from scratch:
    var proto = $$({}, '<p data-bind="name" style="color:red"/>');
    // Create object from prototype object:
    var obj = $$(proto, {name:'Joe Doe'});
    $$.document.append(obj);
<div class="demo"></div>

Refer to the examples in the [home page](/) and elsewhere in this document for several different uses of the factory function, and the [factory function reference](#factory) for syntax details.
    
## [Bindings](#bindings)

Agility offers painless two-way bindings to keep Models and Views in sync. Binding a given DOM element to a model property is as simple as specifying a `data-bind` attribute for the desired element:

    :::javascript
    // Two-way input binding (text)
    var obj = $$({name:'Joe Doe'}, '<p><input type="text" data-bind="name"/> You typed: <span data-bind="name"/></p>');
    $$.document.append(obj);
<div class="demo"></div>

    :::javascript
    // Two-way input binding (search)
    var obj = $$({query:'Type of query'}, '<p><input type="search" data-bind="name"/> Instant model change: <span data-bind="name"/></p>');
    $$.document.append(obj);
<div class="demo"></div>

You can also bind models to DOM element attributes in addition to the element HTML content using the following syntax for `data-bind`:

    :::javascript
    // data-bind syntax
    [model_var] [, attribute1=model_var1 [, attribute2=model_var2] ... ]

where the first (single) argument is the model variable to be bound to the DOM element HTML content, and the subsequent comma-separated pairs specify the binding of a DOM element attribute to a model variable, like so:

    :::javascript
    // Bind model 'content' to element's HTML content, and model 'myStyle' to element's style attribute
    var msg = $$({content:'Greetings!', myStyle:'color:red'}, '<p data-bind="content, style=myStyle"/>');
    $$.document.append(msg);
<div class="demo"></div>

More complex bindings are also supported for other input elements:

    :::javascript
    // Two-way input binding (radio)
    var obj = $$(
      {opt:'opt-a'},
      "<div> \
          <input type='radio' name='test' value='opt-a' data-bind='opt'>a</input> \
          <input type='radio' name='test' value='opt-b' data-bind='opt'>b</input> \
          You selected: <span data-bind='opt'/> \
       </div>"
    );
    $$.document.append(obj);
<div class="demo"></div>

    :::javascript
    // Two-way input binding (checkbox)
    var obj = $$(
      {a:false, b:true},
      "<div> \
          <input type='checkbox' name='test' data-bind='a'/> checked: <span data-bind='a'/><br/> \
          <input type='checkbox' name='test' data-bind='b'/> checked: <span data-bind='b'/><br/> \
       </div>"
    );
    $$.document.append(obj);
<div class="demo"></div>

    :::javascript
    // Two-way input binding (select)
    var obj = $$(
      {opt:'opt-a'},
      "<div> \
        <select data-bind='opt'> \
          <option value='opt-a'>Option A</option>\
          <option value='opt-b'>Option B</option>\
        </select> \
        You selected: <span data-bind='opt'/> \
       </div>"
    );
    $$.document.append(obj);
<div class="demo"></div>

## [Format and style](#format-style)

Agility's views require the specification of `format` (HTML), and encourage the use of `style` (CSS) in-object. This leads to better object reusability and maintainability: there is no need to fish out HTML/CSS parts from different files to reuse an existing object in a new project, and no need to maintain ids/classes throughout separate files. Content, style, and behavior are all contained in one object.

Formats are specified through an HTML string, containing one (and only one) root element that wraps all other elements, so the first two examples below are **not** valid:

    :::javascript
    // INVALID CODE!! (missing root view element)
    var obj = $$({}, 'hey there');
    $$.document.append(obj);

    // INVALID CODE!! (more than one root elements)
    var obj = $$({}, '<div>hey there</div> <button>OK</button>');
    $$.document.append(obj);

    // Valid code
    var obj = $$({}, '<p>hey there</p>');
    $$.document.append(obj);

Formats should always be specified upon object creation. Refer to the [factory function](#factory) for examples on how to initialize the format.

Specifying styles (CSS) in-object is optional, but again, it leads to better code reusability and maintainability. In-object CSS is implemented dynamically, so the object's style sheet is not introduced until the object is created. 

To ensure CSS selectors apply only to the intended object, *make sure all selectors are preceded by the root selector* `&`. (In future versions this might not be necessary anymore).

    :::javascript
    // ANTI-PATTERN!! (applies CSS style globally)
    var obj = $$({}, "<div><span>Please don't do this</span></div>", 'span { color:red; }');
    $$.document.append(obj);

    // Correct: applies style locally
    var obj = $$({}, '<div><span>Do this</span></div>', '& span { color:blue; }');
    $$.document.append(obj);
<div class="demo"></div>

More complex formats and styles can be organized in multiple lines:

    :::javascript
    var obj = $$({
      view: {
        format:'<div>\
                  <div id="hello">Hello</div>\
                  <div id="world">World</div>\
                </div>',
        style:'& { border:5px solid green; color:white; }\
               & div { padding:10px 20px; }\
               & #hello { background:blue; }\
               & #world { background:red; }'
      }
    });
    $$.document.append(obj);
<div class="demo"></div>

If your `format` and/or `style` are too large, it's probably time to split your object into more Agility objects. (Unless of course you are creating a mostly static page, in which case Agility is probably not the best solution).

## [Events](#events)

There are two types of events in Agility: DOM events and Agility events. Both are implicitly bound to controller functions by matching function and event names.

Controller functions can bind to multiple events at the same time by separating the events with a semicolon. For example, a controller function named `click #a; click #b` would fire when either click event occurred.

User-defined controllers extend (i.e. are called in addition to) built-in controllers.

### [DOM events](#events-dom)

Usual DOM events such as `click`, `dblclick`, `mouseenter`, etc are supported through jQuery's event API. Please consult jQuery's API for a [list of events](http://api.jquery.com/bind/) supported. 

When binding to controller functions, DOM events are distinguished from Agility events by the presence of a [jQuery selector](http://api.jquery.com/category/selectors/) using the syntax:

    :::javascript
    // DOM event syntax for controller functions
    'event selector': function(){}

In addition to jQuery's selectors, the root selector `&` is also supported to pick the root element of the view:

    :::javascript
    var button = $$({msg:'Click me'}, '<button data-bind="msg"/>', {
      'click &': function() {
        this.model.set({msg:"I've been clicked!"});
      }
    });
    $$.document.append(button);
<div class="demo"></div>

### [Agility events](#events-agility)

Agility events are fired by the object core, as well as Models and plugins. When binding to a controller function, they are never followed by a space:

    :::javascript
    // Agility event syntax for controller functions
    'event': function(){}
    'event:event_parameter': function(){}

Presently, the following Agility events are fired:

+ `create`: Fired upon object creation.
+ `destroy`: Fired before object is destroyed.
+ `add`: Fired when a new Agility object is added to the object's container.
+ `remove`: Fired with an Agility object is removed from the object's container.
+ `change`: Fired when the model has changed.
+ `change:prop`: Fired when the property `prop` in the model has changed.

The example below defines both a DOM and a Model event handler:

    :::javascript
    var catcher = $$({msg:'Hover over me'}, '<p><span data-bind="msg"/></p>', {
      'mouseenter span': function() {
        this.model.set({msg:'Hovered!'});
      },
      'change:msg': function() {
        this.view.$().append('<p>Model changed!</p>');
      }
    });
    $$.document.append(catcher);
<div class="demo"></div>

**Agility event bubbling**

Like DOM events, Agility events automatically bubble to the containers of objects. However, bubbling events do not trigger event handlers on the parent objects by default. An event handler must declare that it is interested in receiving bubbled events by including the `child:` prefix in its event specification:

    :::javascript
    var parent = $$({
      controller: {
        'child:testevent': function(){
          alert('testevent fired in descendant');
        }
      }
    });

Events can bubble up multiple levels. Only a single `child:` prefix is required to catch an event in any descendant of an obect.

## [Auto-proxying](#auto-proxy)

All user-defined controllers initialized by the factory function `$$()` have their `this` auto-proxied to the owner MVC object, for quick access and consistent behavior no matter what context:

    :::javascript
    var obj = $$({msg:'I only exist because of auto-proxying'}, '<div/>', {
      'myHandler': function(){
        this.view.$().html( this.model.get('msg') );
      }
    });
    $$.document.append(obj);
    
    // Without auto-proxying the 'this' in myHandler would be 'window'
    setTimeout(obj.controller.myHandler, 100);
<div class="demo"></div>

If necessary, properties from the original context should be passed to the controller function.

## [Inheritance](#inheritance)

Agility adopts prototype-based ([differential](http://en.wikipedia.org/wiki/Differential_inheritance)) inheritance. To create a new Agility object from an existing one, pass the latter as the prototype argument to the [factory function](#factory); additional model, view, controller initializers are passed as usual:

    :::javascript
    var proto = $$({}, '<p data-bind="msg"/>', '& {color:red}');
    var obj = $$(proto, {msg:'Hey there!'});
    $$.document.append(obj);
<div class="demo"></div>

You can also bypass differential inheritance (which overrides existing methods) and instead extend controllers with the tilde (`~`) syntax:

    :::javascript
    var proto = $$({}, '<button>Click me</button>', {
      'click &': function(){
        alert('First controller');
      }
    });
    var obj = $$(proto, {}, {}, {
      '~click &': function(){
        alert('Second controller');
      }
    });
    $$.document.append(obj);
<div class="demo"></div>

Since derived objects reuse as much of their ancestors as possible, you can create large numbers of descendants from a prototype without worrying about memory bloat due to redundant storage:

    :::javascript
    // Prototype of cell object with empty model
    var cell = $$({
      model: {},
      view: {
        format: '<div data-bind="num"/>', 
        style: '& { float:left; width:50px; cursor:pointer; text-align:center; }\
                &:hover { background:#ccf }'
      },
      controller: {
        'click &': function(){
          this.destroy();
        }
      }
    });
    // Matrix of cell objects, all stemming from prototype above
    var matrix = $$({}, '<div>Click to erase number: <div id="wrapper"/></div>', {
      'create': function(){
        for (var i=0;i<500;i++) {
          // Inherits from cell
          var newCell = $$(cell, {num:i});
          this.append(newCell, '#wrapper');
        }
      }
    });
    $$.document.append(matrix);
<div class="demo"></div>


## [Persistence](#persistence)

Model persistence, such as server-side and local HTML5 storage, is bundled with the library as the plugin [persist](#persist). This is not included in the core so as to keep it as simple as possible.

# [Reference](#reference)

## [Factory $$()](#factory)

_Creates a new MVC object from the given model, view, and controller arguments, and optionally a prototype object._

**Compact syntax:** 

    :::javascript
    $$([model [,view-format [,controller]]])
    $$([model [,view-format [, view-style [,controller]]]])
    $$([model [,view [,controller]]])
    $$(prototype, [model [,view-format [,controller]]])
    $$(prototype, [model [,view-format [, view-style [,controller]]]])
    $$(prototype, [model [,view [,controller]]])

**Verbose syntax:** 

    :::javascript
    $$([prototype,] [{
      model: {...},
      view: {...},
      controller: {...},
      user_defined_property: {...}
    }])

where:

+ `model`: Javascript object containing the model key-value pairs;
+ `view-format`: String specifying HTML [format](#format-style) of the view; 
+ `view-style`: String specifying CSS [style](#format-style) of the view;
+ `view`: Javascript object containing `format` and/or `style` properties;
+ `controller`: Javascript object containing named functions that match [event types](#events);
+ `prototype`: Agility object to serve as the prototype for new object;
+ `user_defined_property`: Any additional user-defined method/property for the object.

**Examples:** 

Different view initialization methods:

    :::javascript
    // One string: format
    var person1 = $$({name:'Foo Bar'}, '<div data-bind="name"/>');
    // Two strings: format, style
    var person2 = $$({name:'Foo Bar'}, '<div data-bind="name"/>', '& { color:red; font-weight:bold; }');
    // Object: format, style
    var person3 = $$(
      { name:'Foo Bar' }, 
      { format: '<div data-bind="name"/>', style: '& { color:blue; }' }
    );
    // Verbose
    var person4 = $$({
      model: {
        name: 'Foo Bar'
      },
      view: {
        format: '<div data-bind="name"/>',
        style: '& { color:green; font-style:italic; }'
      }
    });
    $$.document.append(person1);
    $$.document.append(person2);
    $$.document.append(person3);
    $$.document.append(person4);
<div class="demo"></div>

Specifying controller functions - compact:

    :::javascript
    var button = $$({}, '<p><button>Click me</button></p>', {
      'click button': function(){
        alert('You clicked me!');
      }
    });
    $$.document.append(button);
<div class="demo"></div>

and verbose:

    :::javascript
    var dataHolder = $$({
      model: {
        first:'Joe', 
        last:'Doe'
      }, 
      view: {
        format: '<p>Wait...</p>'
      }, 
      controller: {
        'change:first': function(){
          alert('First name changed!');
        }
      }
    });
    $$.document.append(dataHolder);

    setTimeout(function(){
      dataHolder.model.set({first:'Mary'});
    }, 2000);
<div class="demo"></div>










## [Core methods](#methods-core)

### [.bind()](#core-bind)

_Binds function to event._

**Syntax:** 

    :::javascript
    .bind(event, fn)

+ `event`: String specifying event type. See [events](#events) section for event syntax.
+ `fn`: function to be called upon event triggering.

**Returns:**

Owner Agility object (for chainable calls).

### [.trigger()](#core-trigger)

_Triggers event, optionally passing parameters to listeners._

**Syntax:** 

    :::javascript
    .trigger(event [,params])

+ `event`: String specifying event type. See [events](#events) section for event syntax.
+ `params`: parameters to be passed to listeners as function arguments.

**Returns:**

Owner Agility object (for chainable calls).

### [.destroy()](#core-destroy)

_Erases self view, removes self from parent container._

**Syntax:** 

    :::javascript
    .destroy()

**Returns:**

Nothing.

### [.parent()](#core-parent)

_Returns the parent container to which the object has been added, or null if it has not yet been added to a container._

**Syntax:**

    :::javascript
    .parent()

**Returns:**

Parent Agility object.




### [&mdash;](#container)

The methods below are specific to the object container.




### [.append()](#core-append)

_Adds an Agility object to the object's container, and appends its view to containing object's view._

**Syntax:** 

    :::javascript
    .append(object [,selector])

+ `object`: The Agility object to be added;
+ `selector`: A jQuery selector specifying where the object's root element should be appended in the object's view. Will append to root element if undefined.

**Returns:**

Owner Agility object (for chainable calls).

### [.prepend()](#core-prepend)

_Adds an Agility object to the object's container, and prepends its view to containing object's view._

**Syntax:** 

    :::javascript
    .prepend(object [,selector])

+ `object`: The Agility object to be added;
+ `selector`: A jQuery selector specifying where the object's root element should be prepended in the object's view. Will prepend to root element if undefined.

**Returns:**

Owner Agility object (for chainable calls).

### [.before()](#core-before)

_Adds an Agility object to the object's container, and inserts its view before given selector of containing object's view._

**Syntax:** 

    :::javascript
    .before(object, selector)

+ `object`: The Agility object to be added;
+ `selector`: jQuery selector before which the object's root element should be inserted.

**Returns:**

Owner Agility object (for chainable calls).

### [.after()](#core-after)

_Adds an Agility object to the object's container, and inserts its view after given selector of containing object's view._

**Syntax:** 

    :::javascript
    .after(object, selector)

+ `object`: The Agility object to be added;
+ `selector`: jQuery selector after which the object's root element should be inserted.

**Returns:**

Owner Agility object (for chainable calls).

### [.remove()](#core-remove)

_Removes an Agility object from the object's container. [This function should rarely be invoked by the user; call instead `.destroy()` within the object to be removed]._

**Syntax:** 

    :::javascript
    .remove(id)

+ `id`: id of the object to be removed (accessed via `._id` property).

**Returns:**

Owner Agility object (for chainable calls).

### [.each()](#core-each)

_Iterates over each Agility object in the object's container._

**Syntax:** 

    :::javascript
    .each(fn)

where:

+ `fn`: Function to be called within the context of each contained object. Access the object via `this`.

**Returns:**

Owner Agility object (for chainable calls).

### [.empty()](#core-empty)

_Removes all Agility objects from object's container by issuing a `.destroy()` for each contained object._

**Syntax:** 

    :::javascript
    .empty()

**Returns:**

Owner Agility object (for chainable calls).

### [.size()](#core-size)

_Returns number of objects within the object's container._

**Syntax:** 

    :::javascript
    .size()

**Returns:**

Number of Agility objects in the object's container.






## [Model methods](#methods-model)

### [.model.set()](#model-set)

_Sets the model data. If model already exists, it's extended._

**Syntax:** 

    :::javascript
    .model.set(object [,params])

+ `object`: The Javascript object containing the data, e.g. `{name:'Joe Doe', birthday:'08/11/71'}`.
+ `params`: Use `{silent:true}` to avoid firing a `change` event; use `{reset:true}` to overwrite model data (and not extend it).

**Returns:**

Owner Agility object (for chainable calls).

### [.model.get()](#model-get)

_Gets model data._

**Syntax:** 

    :::javascript
    .model.get([property])

+ `property`: Desired property, e.g. `'name'`.

**Returns:**

Desired property content if `property` is specified, or a Javascript object containing the entire model data if it's omitted.

### [.model.reset()](#model-reset)

_Resets model to its original value (at object creation time)._

**Syntax:** 

    :::javascript
    .model.reset()

**Returns:**

Owner Agility object (for chainable calls).

### [.model.each()](#model-each)

_Iterates over each model property._

**Syntax:** 

    :::javascript
    .model.each(fn)

+ `fn`: Function to be called with each model property, with arguments `fn(key, value)` where `key` is the property name, and `value` is its content.

**Returns:**

Owner Agility object (for chainable calls).

### [.model.size()](#model-size)

_Gets number of model properties._

**Syntax:** 

    :::javascript
    .model.size()

**Returns:**

Number of model properties.

## [View methods](#methods-view)

### [.view.$()](#view-jquery)

_Shortcut to jQuery object corresponding to root element or to given selector in the current view._

**Syntax:** 

    :::javascript
    .view.$([selector])

+ `selector`: jQuery selector for the desired DOM element in the object's view.

**Returns:**

jQuery object of root element if no selector, jQuery object at given `selector` otherwise, restricted to the current view's DOM.

### [.view.render()](#view-render)

_Updates View's main jQuery object according to `.view.format`. Automatically called upon creation._

**Syntax:** 

    :::javascript
    .view.render()

**Returns:**

Owner Agility object (for chainable calls).

### [.view.stylize()](#view-stylize)

_Applies CSS dynamically according to `.view.style`. Automatically called upon creation._

**Syntax:** 

    :::javascript
    .view.stylize()

**Returns:**

Owner Agility object (for chainable calls).

### [.view.sync()](#view-sync)

_Synchronizes all view elements with model contents, according to established bindings. Automatically called upon creation._

**Syntax:** 

    :::javascript
    .view.sync()

**Returns:**

Owner Agility object (for chainable calls).


## [Controller methods](#methods-controller)

Built-in controllers are intended for internal use and typically shouldn't be called by the user.

Please refer to the [factory function](#factory) and [event types](#events) for syntax and usage examples of user-defined controllers.

## [Globals](#globals)

### [$$.document](#globals-document)

_Main Agility object representing the document's body._

Typically you just `.append()` a new Agility object to it.

# [Built-in plugins](#plugins)

## [persist](#persist)

The plugin `persist` lets you save and retrieve models to/from a storage server using a given adapter. Persistence is always manual, i.e. needs to be explicitly called by user.

All methods fire the generic events:

+ `persist:start`: fired when starting a new request and no other requests are pending.
+ `persist:stop`: fired after all pending requests have stopped.
+ `persist:error`: fired when a persistence error has occurred.

as well as the method-specific events:

+ `persist:METHOD:success`: fired after `METHOD` has successfully completed request.
+ `persist:METHOD:error`: fired if `METHOD` gave rise to an error.

### [.persist()](#persist-persist)

_Initializes persistence plugin, creates persistence methods for owner object._

**Syntax:** 

    :::javascript
    .persist([adapter, params])

where:

+ `adapter`: Function containing the implementation of the persistence algorithms.
+ `params`: Parameters to be passed to adapter: The id property name on the server side, `{id:'id_name'}` (default is simply `{id:'id'}`), and the collection name `{collection:'collection_name'}` (required).

If the adapter-params pair is not given, the only method that can be invoked is [gather](#persist-gather).

**Returns:**

Owner Agility object (for chainable calls).

### [.load()](#persist-load)

_Refreshes model from server, using the id in the model property `id`._

**Syntax:** 

    :::javascript
    .load()

**Examples:** 

Loads model from server:

    :::javascript
    var person = $$({id:123}, '<p>Name: <span data-bind="name"/></p>').persist($$.adapter.restful, {collection:'people'});
    
    $$.document.append(person);
    person.load();
<div class="demo"></div>

**Returns**

Owner Agility object (for chainable calls), with updated model.

### [.save()](#persist-save)

_Updates model on the server if `id` is present in the model, creates a new resource otherwise._

**Syntax:** 

    :::javascript
    .save()

If the resource is to be created (i.e. model has no `id`), the server is expected to send back the new `id` either in the body, e.g.

    :::text
    {"id":123}

or in the `Location` header as the new resource URL, e.g.:

    :::text
    Location: http://your-site.com/api/people/123

Agility will parse either to extract the new `id`, and set the model accordingly. That way, further calls to `.save()` will update the model on the server.

**Examples:** 

Creates new model on server:

    :::javascript
    var person = $$({name:'Joe Doe'}, '<p>Name: <span data-bind="name"/></p>').persist($$.adapter.restful, {collection:'people'});
    
    $$.document.append(person);
    person.save();

Updates model on server:

    :::javascript
    var person = $$({id:123, name:'Joe Doe'}, '<p>Name: <span data-bind="name"/></p>').persist($$.adapter.restful, {collection:'people'});
    
    $$.document.append(person);
    person.save(); // will update, since 'id' exists

**Returns**

Owner Agility object (for chainable calls), with new model `id` (if created new resource).

### [.erase()](#persist-erase)

_Erases model from server, using the `id` given in the model._

**Syntax:** 

    :::javascript
    .erase()

**Returns**

Owner Agility object (for chainable calls).

### [.gather()](#persist-gather)

_Loads a collection of models and appends/prepends into container, using given prototype._

Each gathered MVC object will be added to the container, appended/prepended to the view (depending on specified method), and will be a direct descendant of given prototype object. All persistence information, including collection name, should be initialized in the prototype object.

**Syntax:** 

    :::javascript
    .gather(proto, method, [,selector] [,query])

where:

+ `proto`: Prototypal Agility object with `persist` already initialized.
+ `method`: String containing name of method to be invoked with each new Agility object to be added (e.g. `'append'`, `'prepend'`, `'before'`, `'after'`).
+ `selector`: jQuery selector indicating where the view of `proto` should be appended. Will append to root element if omitted.
+ `query`: Javascript object containing parameters to be passed to the adapter for e.g. HTTP queries, like `{orderBy:'name'}`.

**Examples:** 

Loads a collection of persons from server:

    :::javascript
    // Prototype
    var person = $$({}, '<li data-bind="name"/>').persist($$.adapter.restful, {collection:'people'});
    
    // Container
    var people = $$({}, '<div>People: <ul/></div>').persist();
    $$.document.append(people);

    people.gather(person, 'append', 'ul');
<div class="demo"></div>

Same as above, with load button and "Loading..." Ajax message:

    :::javascript
    // Prototype
    var person = $$({}, '<li data-bind="name"/>').persist($$.adapter.restful, {collection:'people'});
    
    // Container
    var people = $$({
      model: {},
      view: {
        format: 
          '<div>\
            <span>Loading ...</span>\
            <button>Load people</button><br/><br/>\
            People: <ul/>\
          </div>',
        style:
          '& {position:relative}\
           & span {position:absolute; top:0; right:0; padding:3px 6px; background:red; color:white; display:none; }'
      }, 
      controller: {
        'click button': function(){
          this.empty();
          this.gather(person, 'append', 'ul');
        },
        'persist:start': function(){
          this.view.$('span').show();
        },
        'persist:stop': function(){
          this.view.$('span').hide();
        }
      }
    }).persist();
    $$.document.append(people);
<div class="demo"></div>

**Returns**

Owner Agility object (for chainable calls), with container filled with new `proto` descendants.

### [$$.adapter.restful](#persist-restful)

_RESTful adapter._

This adapter sends `GET`, `POST`, etc requests as per [RESTful specs](http://en.wikipedia.org/wiki/Representational_State_Transfer), and expects JSON responses.

The default base URL is `api/`, but it can be overridden at initialization time with the parameter `{baseUrl:'your_url/'}` passed to `persist()`. The collection name and/or resource `id` will be appended to form URLs like

    :::text
    api/resource
    api/resource/123
