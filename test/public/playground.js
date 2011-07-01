
// // Pure model
// var app = $$({name:'Joe Doe'}, '<div><button>Load</button><br/><div id="loading" style="height:30px;"/> <div data-bind="id"/><div data-bind="name"/></div>',{
//   'click button': function(){ this.save(); },
//   'persistStart': function(){ this.view.$('#loading').text('Saving...'); },
//   'persistEnd': function(){ this.view.$('#loading').text(''); },
//   'persistSuccess': function(){ alert('Success!'); }
//   'persistError': function(err){ alert(err); }
// }).persist('/api/people');
// $$.document.add(obj);

// Container
var person = $$({}, '<li data-bind="name"></li>', {}).persist($$.adapter.restful, {collection:'people'});
var app = $$({}, '<div> <div id="msg" style="height:30px;"/> <button>Load</button> <br/>  <ul id="people"></ul> </div>', {
  'click button': function(){ this.gather(person, '#people'); },
  'persist:start': function(){ this.view.$('#msg').text('Loading...'); },
  'persist:end': function(){ this.view.$('#msg').text(''); },
  'persist:success': function(){ console.log('Success!'); },
  'persist:error': function(event, msg){ console.log('Error: ' + msg); }
});
$$.document.add(app);
