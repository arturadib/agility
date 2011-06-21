
module("Object builder");

var validateObject = function(obj) {
  ok( obj.model, "obj.model present" );
  ok( obj.view, "obj.view present" );
  ok( obj.controller, "obj.controller present" );
}
test("No arguments", function(){
  var obj = $$(); // default object
  validateObject( obj );
});
test("One argument (model string)", function(){
  var obj = $$('Joe Doe');
  validateObject( obj );
  equals( obj.view.$root.html(), 'Joe Doe', 'template as expected');
});
test("One argument (model object)", function(){
  var obj = $$({
    first: 'Joe',
    last: 'Doe'
  });
  validateObject( obj );
  equals( obj.view.$root.html(), 'Joe Doe', 'template as expected');
});
test("Two arguments (model, view string)", function(){
  var obj = $$('Joe Doe', '<div>${content}</div>');
  validateObject( obj );
  equals( obj.view.$root.html(), 'Joe Doe', 'template as expected');
});
test("Two arguments (model object, view string)", function(){
  var obj = $$({
    first: 'Joe',
    last: 'Doe'
  }, '<div>${first} ${last}</div>');
  validateObject( obj );
  equals( obj.view.$root.html(), 'Joe Doe', 'template as expected');
});
