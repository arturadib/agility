
Agility.js is an [MVC](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) library for Javascript that lets you write maintainable and reusable browser code without the verbosity overhead found in [related](http://documentcloud.github.com/backbone/) [libraries](http://www.sproutcore.com/). The goal is to enable developers to write web apps at least as quickly as with jQuery, while ensuring long-term maintainability through an MVC scaffold.

See documentation for a [list of features](docs.html#intro-features).

The library itself is a small Javascript file (goal is to remain under 10K), and its only dependency is a recent version of jQuery (Zepto support coming soon). The project is licensed under the liberal [MIT license](https://github.com/arturadib/agility/blob/master/LICENSE).

## Quick tour

All examples in this tour are self-contained. See [Getting started](docs.html#getting-started) in the docs for the HTML template adopted.

### Object initialization

Agility works with a single object type that contains an entire model-view-controller stack. These MVC objects are built by passing initializers to the [factory function](docs.html#factory) `$$()`, which takes care of setting up default bindings, auto-proxying, etc. The example below initializes an MVC object with empty model, a simple view, and default controllers:

    :::javascript
    // Hello World
    // Compact syntax: initializers are passed in the order M, V, C:
    var message = $$({}, '<div>Hello World</div>');
    $$.document.add(message);
<div class="demo"></div>

A more explicit initialization syntax is also supported to enhance clarity:

    :::javascript
    // Hello World
    // Verbose syntax:
    var message = $$({
      model: {}, 
      view: {
        format: '<div>Hello World</div>'
      }, 
      controller: {}
    });
    $$.document.add(message);
<div class="demo"></div>

### Model-view bindings

The framework comes with a powerful model-view binder, so that views are always in sync with models and vice-versa. Establishing bindings is as simple as introducing a `data-bind` attribute in the desired DOM element; the factory function takes care of creating the necessary controllers:

    :::javascript
    // Bind model to element's HTML content
    var message = $$({txt:'Hello World'}, '<div data-bind="txt"/>');
    $$.document.add(message);

    // Bind model to element's attribute
    var url = 'http://google.com/favicon.ico';
    var icon = $$({path:url}, '<img data-bind="src path"/>');
    $$.document.add(icon);
<div class="demo"></div>

Bindings are always two-way, and work with most input types:

    :::javascript
    // Two-way binding (checkbox)
    var check = $$(
      {a:false, b:true},
      "<div> \
          <input type='checkbox' name='test' data-bind='a'/> checked: <span data-bind='a'/><br/> \
          <input type='checkbox' name='test' data-bind='b'/> checked: <span data-bind='b'/><br/> \
       </div>"
    );
    $$.document.add(check);
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
    $$.document.add(person);
<div class="demo"></div>

### Inheritance and hierarchy

Agility adopts a simple object hierarchy model. Objects can serve as the prototype of other objects ([differential inheritance](http://en.wikipedia.org/wiki/Differential_inheritance)):

    :::javascript
    // Base object with empty model:
    var proto = $$({}, '<p data-bind="name" style="color:red"/>');
    // Derived objects with specified models:
    var obj1 = $$(proto, {name:'Joe Doe'});
    var obj2 = $$(proto, {name:'Foo Bar'});
    $$.document.add(obj1);
    $$.document.add(obj2);
<div class="demo"></div>

as well as containers for other Agility objects:

    :::javascript
    var counter = 0;
    var item = $$({}, '<li>I\'m item #<span data-bind="id"/></li>');
    var list = $$({}, '<div> <button>Click me</button> <ul></ul> </div>', {
      'click button': function(){
        var newItem = $$(item, {id:counter});
        this.add(newItem, 'ul'); // add object to container, append view at <ul>
        counter++;
      }
    })    
    $$.document.add(list);
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
    $$.document.add(clock);
<div class="demo"></div>

### Short examples

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
        this.add(newItem, 'ul'); // add to container, appending at <ul>
      }
    });
    
    $$.document.add(list);
<div class="demo"></div>
