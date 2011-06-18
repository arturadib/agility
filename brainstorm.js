
//
// via DOM+jQuery:
//
<style type="text/css">
  .clickable { font-size:150%; }
</style>
...
var $person1 = $('<div class="clickable">John Smith</div>').appendTo('body');
var $person2 = $('<div class="clickable">Joe Doe</div>').appendTo('body');
$('body .clickable').click(function(e){
  alert('Clicked name is ' + $(e.currentTarget).html());
});

//
// via Backbone
//
<style type="text/css">
  .clickable { font-size:150%; }
</style>
...
var Person = Backbone.Model.extend();

person = new Model({
  name:"John Smith"
});

var PersonView = Backbone.View.extend({
  el: $('body'),
  initialize: {
    this.render();
  },
  events: {
    'click': 'clickHandler'
  },
  render: function(){
    $(this.el).append('<div>'+this.model.get('name')+'</div>');
    return this;
  },
  clickHandler(e){
    alert('Clicked name is ' + $(e.currentTarget).html());
  }
});

personView = new PersonView({
    model: person
});

//
// via [NEW FRAMEWORK]
//
var person = Object.create(FRAMEWORK_OBJ);
person.content.name = 'John Smith';
person.format = '<div>{{name}}</div>';
person.behavior.click = function(){
    alert('');
}

//
// ...or..
//
var person = {
  content: { name: 'John Smith' },
  format: 'Name: ${name}',
  style: 'font-size:150%;',
  behavior: { 
    click: function(){
      alert('Clicked name is ' + this.content.name);
    }
  }
}
X.create(person);

//
// Multiple persons
//

var person = {
  format: '<div>Name: ${name}</div>',
  style: 'font-size:150%;',
  events: { 
    click: function(){
      alert('Clicked name is ' + this.data.name);
    }
  }
}
var person1 = $$(person, { name:'John Smith' });
var person2 = $$(person, { name:'Joe Doe' });
person1.appendTo($$.body);
person2.appendTo($$.body);

// economic syntax: $$() creates a new object
var person = $$('<div>Name: ${name}</div>', 'font-size:150%', {
  click: function(){
    alert('Clicked name is ' + this.data.name);
  }
});
$$(person, { name:'John Smith' }).appendTo($$.body);
$$(person, { name:'Joe Doe' }).appendTo($$.body);

// MVC
var person = {
  view: '<div>Name: ${name}</div>',
  controller: { 
    click: function(){
      alert('Clicked name is ' + this.model.name);
    }
  }
}
var person1 = $$(person, { name:'John Smith' });
var person2 = $$(person, { name:'Joe Doe' });

// List
var persons = {  
  view: '<div><button>Add item</button> <ul id="the-list"></ul></div>', // could also be a function()
  controller: {
    'click button': function(){
      $$({name:'Hello World'}, '<li>Name: ${name}</li>').appendTo(self, '#the-list');
    },
    init: function(){      
    }
  }
}


// One-liners: one item
var hello = $$('Hello World'); // == $$({content:'Hello World'}, '<div>${content}</div>');
$$.document.add(hello); // two things: 1) $$.document._tree.hello now exists; 2) $$.document's add() handler will by default append given element to <body>
hello.model({content: "Hey Earth!!"}); // setter: calls change(), which by default maps to render(), which by default uses $.tmpl()

// One-liners: one item
var hello = $$('Hello World', '<div>${content}</div>'); // == $$({content:'Hello World'}, '<div>${content}</div>');
$$.document.add(hello); // two things: 1) $$.document._tree.hello now exists; 2) $$.document's add() handler will by default append given element to <body>
hello.model({content: "Hey Earth!"}); // setter: calls change(), which by default maps to render(), which by default uses $.tmpl()

// One-liners: div list
var item = $$(null, '<div>${content}</div>'); // prototype
var list = $$(null, '<div><button>Add item</button></div>', {
  'click button': function(){
    var newItem = $$(item).extend({content:'Hello World'});
    self.add(newItem); // calls view:add($$obj), which by default appends to self
  }
});
$$.document.add(list);
  
// One-liners: ul list
var item = $$(null, '<li>${content}</li>'); // prototype
var list = $$(null, '<div><button>Add item</button> <ul id="list"></ul></div>', {
  'click button': function(){
    var newItem = $$(item).model({content:'Hello World'});
    self.add(newItem, '#list'); // now newItem.parent == self; calls view:add($$obj, '#list'), which will append to specified element
  }
});
$$.add(document.add, list);

// One-liners: ul list, with self-remove
var item = $$(null, '<li>${content} <button>x</button></li>', {
  'click button': function(){
    self.remove(); // destroy self, update view (delete self.parent[ownName])
  }
}); // prototype
var list = $$(null, '<div><button>Add item</button> <ul id="list"></ul></div>', {
  'click button': function(){
    var newItem = $$(item).model({content:'Hello World'});
    self.add(newItem, {selector:'#list'}); // calls view,controller:add($$obj, {params}) which will append to specified element
  }
});
$$.document.add(list);

// One-liners: ul list, with self-remove, showing default implementation of view:add()
var item = $$(null, '<li>${content} <button>x</button></li>', {
  'click button': function(){
    self.remove(); // destroy self, update view (delete self.parent[ownName])
  }
}); // prototype
var list = $$({
  view: {
    format: '<div><button>Add item</button> <ul id="list"></ul></div>',
    add: function($$obj, params){
      this.$(params.select).append( $$obj.view.html );
    }
  }, 
  controller: {
    'click button': function(){
      var newItem = $$(item).model({content:'Hello World'});
      this.add(newItem, {selector:'#list'}); // calls view,controller:add($$obj, {params}) which will append to specified element
    }
  }
});
$$.document.add(list);

//
// 
// The prototypical object
//
//
{
  // Core MVC
  model: (function(){
    var _model = {};   
    return function(arg){      
    };
  })(),
  view: {
    format: '',
    style: '',
    render: function($$obj || html, to){}
    append: function($$obj || html, to){}
  },
  controller: {
    init: function(){},
    render: function(){},
  },

  // Aux
  add: function(){},
  remove: function(){}
}
