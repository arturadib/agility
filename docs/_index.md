
Agility.js is an [MVC](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) library for Javascript that lets you write maintainable and reusable browser code without the verbose or infrastructural overhead found in [other](http://documentcloud.github.com/backbone/) [MVC](http://www.sproutcore.com/) [libraries](http://knockoutjs.com/). The goal is to enable developers to write web apps at least as quickly as with jQuery, while simplifying long-term maintainability through MVC objects.

<div class='download'>
  <div><b>Latest version: __VERSION__</b> | <a href="https://raw.github.com/arturadib/agility/master/ChangeLog">ChangeLog</a></div>
  <div>Download <a href="agility.min.js">minified js</a> (~4K packed + gzipped)</div>
  <div>Download <a href="agility-start.zip">"getting started" package</a> (zip) or <a href="https://github.com/arturadib/agility/tree/master/docs/agility-start">browse its contents</a></div>
</div>

The library itself is a small Javascript file (goal is to remain under 10K), and its only dependency is a recent version of jQuery. The project is licensed under the liberal [MIT license](https://github.com/arturadib/agility/blob/master/LICENSE).

See the documentation for a more complete [list of features](docs.html#intro-features).

## Quick tour

Agility supports (but does not require) writing your entire code in Javascript, that is, content (HTML), style (CSS), and behavior (JS) can all be contained within Javascript objects. Unless otherwise stated the examples in this tour consist of such code. See [Getting started](docs.html#getting-started) in the docs for the HTML template adopted.

### Object initialization

Agility works with a single object type that contains a full model-view-controller stack. These MVC objects are built by passing initializers to the [factory function](docs.html#factory) `$$()`, which takes care of setting up default bindings, auto-proxying, etc. The example below initializes an MVC object with empty model, a simple view, and default controllers:

    :::javascript
    // Hello World
    var message = $$({
      model: {}, 
      view: {
        format: '<div>Hello World</div>'
      }, 
      controller: {}
    });
    $$.document.append(message);
<div class="demo"></div>

A more compact syntax is also supported. It's handy when dealing with simple objects:

    :::javascript
    // Hello World
    // Compact syntax: initializers are passed in the order M, V, C:
    var message = $$({}, '<div>Hello World</div>');
    $$.document.append(message);
<div class="demo"></div>


### External HTML

Inline HTML is useful for things like quick prototyping, but sometimes it's useful to keep format and behavior separate. In this case you can pull the HTML from a DOM element, like so:

    :::javascript
    // Hello World
    var message = $$({
      model: {}, 
      view: {
        format: $('#my-format').html()
      }, 
      controller: {}
    });
    $$.document.append(message);

And then in your HTML file:

    <script id="my-format" type="text/html">
       <div>Hello World</div>
    </script>


### Model-view bindings

Agility comes with a powerful model-view binder, so that views are always in sync with models and vice-versa. Establishing bindings is as simple as introducing a `data-bind` attribute in the desired DOM element; the factory function takes care of creating the necessary controllers:

    :::javascript
    // Bind model to element's HTML content
    var message = $$({txt:"I'm text from a model"}, '<div data-bind="txt"/>');
    $$.document.append(message);

    // Bind model to element's attribute
    var url = 'http://google.com/favicon.ico';
    var icon = $$({path:url}, '<p>Image src from model: <img data-bind="src=path"/></p>');
    $$.document.append(icon);
<div class="demo"></div>

Bindings are always two-way (instant updates in both directions), and work with most input types:

    :::javascript
    // Two-way binding (checkbox)
    var check = $$(
      {a:false, b:true},
      "<div> \
          <input type='checkbox' name='test' data-bind='a'/> checked: <span data-bind='a'/><br/> \
          <input type='checkbox' name='test' data-bind='b'/> checked: <span data-bind='b'/><br/> \
       </div>"
    );
    $$.document.append(check);
<div class="demo"></div>

### Controller-event bindings

User-defined controllers are bound to events by automatically matching function and event names. To handle DOM events, start with the event name followed by a DOM selector. Agility events (e.g. object creation, model change, etc) are never followed by a selector:

    :::javascript
    var person = $$({}, '<p><input type="text" data-bind="name"/> <span id="msg"/></p>', {
      'create': function(){
        // Fired upon object creation
        this.view.$('#msg').text('Enter name');
      },
      'change': function(){
        // Fired upon model change
        this.view.$('#msg').text('Name changed to: '+this.model.get('name'));
      },
      'focus input': function(){
        // Fired upon DOM event 'focus' on element input
        // 'this' is always auto-proxied to the owner MVC object
        this.view.$('#msg').text('Focused on input!');
      }
    });
    $$.document.append(person);
<div class="demo"></div>

### Inheritance and containers

Agility adopts a simple object hierarchy model. Objects can serve as the prototype of other objects ([differential inheritance](http://en.wikipedia.org/wiki/Differential_inheritance)):

    :::javascript
    // Base object with empty model:
    var proto = $$({}, '<p data-bind="name" style="color:red"/>');
    // Derived objects with specified models:
    var obj1 = $$(proto, {name:'Joe Doe'});
    var obj2 = $$(proto, {name:'Foo Bar'});
    $$.document.append(obj1);
    $$.document.append(obj2);
<div class="demo"></div>

as well as containers for other Agility objects:

    :::javascript
    var counter = 0;
    var item = $$({}, '<li>I\'m item #<span data-bind="id"/></li>');
    var list = $$({}, '<div> <button>Click me</button> <ul></ul> </div>', {
      'click button': function(){
        var newItem = $$(item, {id:counter});
        this.prepend(newItem, 'ul'); // add object to container, prepend view at <ul>
        counter++;
      }
    })    
    $$.document.append(list);
<div class="demo"></div>

### In-object content, style, and behavior

Views don't require styles (CSS) to be declared in-object, but doing so leads to fully reusable objects and eliminates the need to maintain HTML and CSS files. For example, the object `clock` below can be copied-and-pasted into any Agility project - its content, style, and behavior are preserved without having to fish out HTML and CSS elements/selectors from different files:

    :::javascript
    var clock = $$({
      model: {
        time: '12:00:00'
      },
      view: {
        format: '<span data-bind="time"/>',
        style: '& { color:white; background:#88f; padding:4px 8px; }'
      },
      controller: {
        'create': function(){          
          var self = this;
          setInterval(function(){
            self.model.set({time: (new Date()).toLocaleTimeString()});
          }, 1000);
        }
      }
    });
    $$.document.append(clock);
<div class="demo"></div>

### Persistence

Server- and client-side persistence can be implemented through the built-in plugin [persist](docs.html#persist). You can setup and `load` a model from a RESTful service in one line (the view is automatically updated via model-view binding):

    :::javascript
    var person = $$({id:123}, '<p>Name: <span data-bind="name"/></p>', '& span {background:blue; color:white; padding:3px 6px;}');    

    // Initialize plugin with RESTful adapter, load model with above id:
    person.persist($$.adapter.restful, {collection:'people'}).load();
    
    $$.document.append(person);
<div class="demo"></div>

(View JSON server response used in the request above: [GET api/people/123](api/people/123)).

You can also `gather` an entire collection of models and insert them as MVC objects (derived from a prototype) into an object's container, as illustrated below. This example also shows how Ajax "loading" icons/messages are implemented through two simple controllers:

    :::javascript
    //
    // person: prototype (will be 'gathered' below)
    //
    var person = $$({}, '<li data-bind="name"/>').persist($$.adapter.restful, {collection:'people'});

    //
    // people: persons container
    //
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
        // Ajax loading message - start
        'persist:start': function(){
          this.view.$('span').show();
        },
        // Ajax loading message - stop
        'persist:stop': function(){
          this.view.$('span').hide();
        }
      }
    }).persist(); // this makes .gather() available
    $$.document.append(people);
<div class="demo"></div>

(View JSON server response used in the request above: [GET api/people/](api/people/)).


### The infamous To-Do example

Last but not least, no modern MVC library is complete without a simple To-Do list example. The fully functional example below has 17 lines of code:

    :::javascript
    //
    // Item prototype
    //
    var item = $$({}, '<li><span data-bind="content"/> <button>x</button></li>', '& span { cursor:pointer; }', {
      'click span': function(){
        var input = prompt('Edit to-do item:', this.model.get('content'));
        if (!input) return;
        this.model.set({content:input});
      },
      'click button': function(){
        this.destroy();
      }
    });
    
    //
    // List of items
    //
    var list = $$({}, '<div> <button id="new">New item</button> <ul></ul> </div>', {
      'click #new': function(){
        var newItem = $$(item, {content:'Click to edit'});
        this.append(newItem, 'ul'); // add to container, appending at <ul>
      }
    });
    
    $$.document.append(list);
<div class="demo"></div>
