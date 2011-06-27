// // One-liners: one item
// var hello = $$('Hello World', '<button>${text}</button>', {
//   'click :root': function(event){
//     alert('hey there');
//   }
// });
// $$.document.add(hello);

// // No inheritance
// var list = $$({}, '<div><button id="add">Add item</button> <ul id="list"></ul></div>', {
//   'click button#add': function(){
//     var newItem = $$('Hello World', '<li>${text} <button>x</button></li>', {
//       'click button': function(){
//         alert('remove!');
//       }
//     });
//     this.add(newItem, '#list'); // now newItem.parent == this; calls view:add($$obj, '#list'), which will append to specified element
//   }
// });
// $$.document.add(list);

// // No inheritance with Style
// var list = $$({}, 
//   {
//     template: '<div><button id="add">Add item</button> <ul id="list"></ul></div>', 
//     style: '& > button { font-size:150%; }'
//   },
//   {
//     'click button#add': function(){
//       var newItem = $$('Hello World', '<li>${text} <button>x</button></li>', '& { color:red; }', {
//         'click button': function(){
//           alert('remove!');
//         }
//       });
//       this.add(newItem, '#list'); // now newItem.parent == this; calls view:add($$obj, '#list'), which will append to specified element
//     }
//   }
// );
// $$.document.add(list);

// // Inheritance
// var list = $$({}, '<div><button id="add">Add item</button> <ul id="list"></ul></div>', {
//   init: function(){
//     // Item prototype
//     this.itemProto = $$({}, '<li>${text} <button>x</button></li>', {
//       'click button': function(){
//         this.remove();
//       }
//     });
//   },
//   'click button#add': function(){
//     // Item object
//     var item = $$(this.itemProto, 'Hello '+Math.random());
//     this.add(item, '#list');
//   }
// });
// $$.document.add(list);

// // Inheritance, using {model, view, controller}
// var list = $$({
//   model: {    
//   },
//   view: {
//     template: '<div><button id="add">Add item</button> <ul id="list"></ul></div>'
//   },
//   controller: {
//     init: function(){
//       // Prototype
//       this.item = $$({}, '<li>${text} <button>x</button></li>', {
//         'click button': function(){
//           this.remove();
//         }
//       });
//     },
//     'click button#add': function(){
//       var newItem = $$(this.item, 'Hello '+Math.random());
//       this.add(newItem, '#list');
//     }
//   }
// });
// $$.document.add(list);

// Inheritance with Style
var item = $$({}, 
  '<li>${text} <button>x</button></li>', 
  '& { color:red }', 
  { // item prototype
    'click button': function(){
      this.destroy();
    }
  }
);
var list = $$({}, 
  {
    template: '<div><button id="add">Add item</button> <ul id="list"/></div>', 
    style: '& { width:400px; margin-left:auto; margin-right:auto; background:#eee; }  & > button { font-size:150%; }'
  },
  {
    'click button#add': function(){
      // Item object
      var newItem = $$(item, 'Hello '+Math.random());      
      this.add(newItem, '#list');
    }
  }
);
$$.document.add(list);
