Agility.js is an [MVC](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) library that lets you write maintainable and reusable browser code without the verbosity overhead found in [similar](http://documentcloud.github.com/backbone/) [libraries](http://www.sproutcore.com/). The goal is to enable developers to write web apps at least as quickly as with jQuery, while ensuring long-term maintainability through an MVC scaffold.

The library itself is a small Javascript file (goal is to remain under 10K), and its only dependency is a recent version of jQuery (Zepto support coming soon). The project is licensed under the liberal [MIT license](https://github.com/arturadib/agility/blob/master/LICENSE).

## Quick tour

Agility is framed around the notion of all-in-one MVC objects, which are initialized by passing model, view, and controller arguments to the [factory function](docs.html#factory) `$$()`. The "hello world" example below creates a minimalist MVC object `message` by passing a model and a view to the factory function. Only built-in controllers are used in this case:

    :::javascript
    var message = $$({txt:'Hello World'}, '<div data-bind="txt"/>');
    $$.document.add(message);
<div class="demo"></div>

Custom controllers are bound to events by automatically matching function and event names, and are incremental by default (i.e. are called in addition to built-in controllers). The custom controller below responds to model changes:

    :::javascript
    var person = $$({name:'Enter name'}, '<input type="text" data-bind="name"/>', {
      'change': function(){
        // "this" is always proxied to the owner MVC object:
        alert('Name changed to:\n' + this.model.get('name'));
      }
    });
    $$.document.add(person);
<div class="demo"></div>

Model-view bindings are two-way (so one is always in sync with the other), and establishing them is as simple as introducing a `data-bind` attribute in the desired DOM element. The example below illustrates two-way bindings in action:

    :::javascript
    var person = $$({name:'Type your name'}, '<input type="text" data-bind="name"/>');
    var who = $$({}, '<button>Who?</button>', {
      'click &': function(){
        alert('You name is:\n'+person.model.get('name')); // get model property
        person.model.set({name: 'Type again'}); // reset model
      }
    });
    $$.document.add(person);
    $$.document.add(who);
<div class="demo"></div>

You can also bind to element attributes in addition to HTML content:

    :::javascript
    var url = 'http://google.com/favicon.ico';
    var icon = $$({path:url}, '<img data-bind="src path">');
    $$.document.add(icon);
<div class="demo"></div>

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

Views don't require styles (CSS) to be declared inline, but doing so leads to fully reusable objects ("plug-and-play") and is highly encouraged. The object `clock` below is completely self-contained, and can be copied-and-pasted into any Agility project without losing its content, style, or behavior. This example also illustrates a slightly more verbose initialization syntax:

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

Last but not least, no modern MVC library is complete without a simple To-Do list example. The fully functional example below has 17 lines of code:

    :::javascript
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
    var list = $$({}, '<div> <button id="new">New item</button> <ul></ul> </div>', {
      'click #new': function(){
        var newItem = $$(item, {content:'Click to edit'});
        this.add(newItem, 'ul'); // add to container, appending at <ul>
      }
    })    
    $$.document.add(list);
<div class="demo"></div>
