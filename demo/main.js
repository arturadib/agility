// // One-liners: one item
// var hello = $$('Hello World', '<button>${content}</button>', {
//   'click root': function(event){
//     alert('hey there');
//   }
// });
// $$.document.add(hello);

// // No inheritance
// var list = $$({}, '<div><button id="add">Add item</button> <ul id="list"></ul></div>', {
//   'click button#add': function(){
//     var newItem = $$('Hello World', '<li>${content} <button>x</button></li>', {
//       'click button': function(){
//         alert('remove!');
//       }
//     });
//     this.add(newItem, '#list'); // now newItem.parent == this; calls view:add($$obj, '#list'), which will append to specified element
//   }
// });
// $$.document.add(list);

// Inheritance
var list = $$({}, '<div><button id="add">Add item</button> <ul id="list"></ul></div>', {
  init: function(){
    // Prototype
    this.item = $$({}, '<li>${text} <button>x</button></li>', {
      'click button': function(){
        this.remove();
      }
    });
  },
  'click button#add': function(){
    var newItem = $$(this.item, 'Hello '+Math.random());
    this.add(newItem, '#list'); // now newItem.parent == this; calls view:add($$obj, '#list'), which will append to specified element
  }
});
$$.document.add(list);
