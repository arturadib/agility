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
var item = $$({}, '<li>${text} <button>x</button></li>', {
  'click button': function(){
    alert('remove!');
  }
});
var list = $$({}, '<div><button id="add">Add item</button> <ul id="list"></ul></div>', {
  'click button#add': function(){
    var newItem = $$(item, 'Hello '+Math.random());
    this.add(newItem, '#list'); // now newItem.parent == this; calls view:add($$obj, '#list'), which will append to specified element
  }
});
$$.document.add(list);
