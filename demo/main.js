// // One-liners: one item
// var hello = $$('Hello World', '<button>${content}</button>', {
//   'click root': function(event){
//     alert(event);
//   }
// });
// $$.document.add(hello);

var list = $$({}, '<div><button>Add item</button> <ul id="list"></ul></div>', {
  'click button': function(){
    var item = $$('Hello World', '<li>${content}</li>'); // prototype
    this.add(item, '#list'); // now newItem.parent == this; calls view:add($$obj, '#list'), which will append to specified element
  }
});
$$.document.add(list);
