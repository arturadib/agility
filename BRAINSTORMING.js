
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
    this.add(newItem); // calls view:add($$obj), which by default appends to self
  }
});
$$.document.add(list);
  
// One-liners: ul list
var item = $$(null, '<li>${content}</li>'); // prototype
var list = $$(null, '<div><button>Add item</button> <ul id="list"></ul></div>', {
  'click button': function(){
    var newItem = $$(item).model({content:'Hello World'});
    this.add(newItem, '#list'); // now newItem.parent == this; calls view:add($$obj, '#list'), which will append to specified element
  }
});
$$.add(document.add, list);

// One-liners: ul list, with self-remove
var item = $$(null, '<li>${content} <button>x</button></li>', {
  'click button': function(){
    this.remove(); // destroy self, update view (delete this.parent[ownName])
  }
}); // prototype
var list = $$(null, '<div><button>Add item</button> <ul id="list"></ul></div>', {
  'click button': function(){
    var newItem = $$(item).model({content:'Hello World'});
    this.add(newItem, {selector:'#list'}); // calls view,controller:add($$obj, {params}) which will append to specified element
  }
});
$$.document.add(list);

// One-liners: ul list, with self-remove, showing default implementation of view:add()
var item = $$(null, '<li>${content} <button>x</button></li>', {
  'click button': function(){
    this.remove(); // destroy self, update view (delete self.parent[ownName])
  }
}); // prototype
var list = $$({
  view: {
    template: '<div><button>Add item</button> <ul id="list"></ul></div>',
    append: function($$obj, selector){
      this.$(selector).append( $$obj.view.html );  // default implementation
    }
  }, 
  controller: {
    'click button': function(){
      var newItem = $$(item).model({content:'Hello World'});
      this.add(newItem, '#list'); // calls view,controller:add($$obj, {params}) which will append to specified element
    }
  }
});
$$.document.add(list);


//
// Builder: Decorating a prototypical MVC object
//
var mvc = $$(); // verbatim prototype
var mvc = $$('Joe Doe', '<div>${content}</div>'); // override model._model.content, view.template
var mvc = $$({name:'Joe Doe'}, {template:'<div>${name}</div>'}); // override model._model.name, view.template
var mvc = $$({name:'Joe Doe'}, {template:'<div>${name}</div>'}, { // override model._model.name, view.template, controller.init()
  init: function(){
    // no render
  }
}); 
var mvc = $$({
  model: {
    name: 'haha'
  },
  view: {
    template: '<div>${name}</div>'
  },
  controller: {
    hover: function(){
      alert('hovered');
    }
  }
});

//
// Builder: Specifying existing prototypical object
//
var baseObj = $$();
var mvc = $$(baseObj);

//
// Builder: From scratch
//
var mvc = $$({
  clear: true,
  model: {
    name: 'haha'
  },
  view: {
    template: '<div>${name}</div>'
  },
  controller: {
    hover: function(){
      alert('hovered');
    }
  }  
});


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
    template: '',
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
