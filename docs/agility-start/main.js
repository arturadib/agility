//
// To-Do example
// You can replace this file with any of the examples from agilityjs.com...
// ... they work right out of the box!
//

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
