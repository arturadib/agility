// // One-liners: one item
// var hello = $$('Hello World');
// $$.document.add(hello);

// // One-liners: one item
// var hello = $$('Hello World', '<div>Content: <span data-bind="text"></span></div>');
// $$.document.add(hello);

// // Two-way binding (manual)
// var obj = $$({name:'initial value'}, "<div><input type='text'/> <br/><br/> Content: <span/></div>",{
//   'change input': function(event){ this.model.set({name:$(event.target).val()}); },
//   'modelChange:name': function(){ this.view.$('input').val(this.model.get('name')); this.view.$('span').text(this.model.get('name')); }
// });
// $$.document.add(obj);

// // Two-way binding (text input)
// var obj = $$({name:'initial value'}, "<div><input type='text' data-bind='name'/> <br/><br/> Content: <span data-bind='name'/></div>");
// $$.document.add(obj);

// // Two-way binding (checkbox)
// var obj = $$(
//   {a:false, b:true},
//   "<div> \
//       <input type='checkbox' name='test' id='a' data-bind='a'/> checked: <span data-bind='a'/><br/> \
//       <input type='checkbox' name='test' id='b' data-bind='b'/> checked: <span data-bind='b'/><br/> \
//    </div>"
// );
// $$.document.add(obj);

// Two-way binding (radio)
var obj = $$(
  {opt:'opt-a'},
  "<div> \
      <input type='radio' name='test' id='a' value='opt-a' data-bind='opt'/> <br/> \
      <input type='radio' name='test' id='b' value='opt-b' data-bind='opt'/> <br/> \
      You selected: <span data-bind='opt'/> \
   </div>"
);
$$.document.add(obj);

// // No inheritance
// var list = $$({}, '<div><button id="add">Add item</button> <ul id="list"></ul></div>', {
//   'click button#add': function(){
//     var newItem = $$('Hello World', '<li><span data-bind="text"></span> <button>x</button></li>', {
//       'click button': function(){
//         alert('remove!');
//       }
//     });
//     this.add(newItem, '#list');
//   }
// });
// $$.document.add(list);

// // No inheritance with Style
// var list = $$({}, 
//   {
//     format: '<div><button id="add">Add item</button> <ul id="list"></ul></div>', 
//     style: '& > button { font-size:150%; }'
//   },
//   {
//     'click button#add': function(){
//       var newItem = $$('Hello World', '<li><span data-bind="text"></span> <button>x</button></li>', '& { color:red; }', {
//         'click button': function(){
//           alert('remove!');
//         }
//       });
//       this.add(newItem, '#list');
//     }
//   }
// );
// $$.document.add(list);

// // Inheritance
// // Item prototype
// var item = $$({}, '<li><span data-bind="text"></span> <button>x</button></li>', {
//   'click button': function(){
//     this.remove();
//   }
// });
// var list = $$({}, '<div><button id="add">Add item</button> <ul id="list"></ul></div>', {
//   'click button#add': function(){
//     // Item object
//     var newItem = $$(item, 'Hello '+Math.random());
//     this.add(newItem, '#list');
//   }
// });
// $$.document.add(list);

// // Inheritance, using {model, view, controller}
// // Prototype
// var item = $$({}, '<li><span data-bind="text"></span> <button>x</button></li>', {
//   'click button': function(){
//     this.remove();
//   }
// });
// var list = $$({
//   model: {    
//   },
//   view: {
//     format: '<div><button id="add">Add item</button> <ul id="list"></ul></div>'
//   },
//   controller: {
//     'click button#add': function(){
//       var newItem = $$(item, 'Hello '+Math.random());
//       this.add(newItem, '#list');
//     }
//   }
// });
// $$.document.add(list);

// // Inheritance with Style
// var item = $$({}, 
//   '<li><span data-bind="text"></span> <button>x</button></li>', 
//   '& { color:red }', 
//   { // item prototype
//     'click button': function(){
//       this.remove();
//     }
//   }
// );
// var list = $$({}, 
//   {
//     format: '<div><button id="add">Add item</button> <ul id="list"/></div>', 
//     style: '& { width:400px; margin-left:auto; margin-right:auto; background:#eee; }  & > button { font-size:150%; }'
//   },
//   {
//     'click button#add': function(){
//       // Item object
//       var newItem = $$(item, 'Hello '+Math.random());      
//       this.add(newItem, '#list');
//     }
//   }
// );
// $$.document.add(list);
