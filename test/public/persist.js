(function($, $$){

  module("Persistence");
  
  asyncTest("Server check", function(){
    expect(16);

    // server check
    $.get('/api/', function(res){
      equals(res, 'agility is the way of the future', 'server online');
    });

    // model - create
    var obj = $$({name:'Joe Doe'}, {}, {
      'persist:save:success': function(){
        equals(this.model.get('id'), 123, "model created");          
      }
    }).persist($$.adapter.restful, {collection:'people'});
    obj.save();

    // model - update
    obj = $$({id:123, name:'Joe Doe'}, {}, {
      'persist:save:success': function(){
        equals(true, true, "model updated");
      }
    }).persist($$.adapter.restful, {collection:'people'});
    obj.save();

    // model - load
    obj = $$({id:123}, {}, {
      'persist:load:success': function(){
        equals(this.model.get('name'), 'Joe Doe', "model loaded");          
      }
    }).persist($$.adapter.restful, {collection:'people'});
    obj.load();
    
    // model - erase
    obj = $$({id:123, name:'Joe Doe'}, {}, {
      'persist:erase:success': function(){
        equals(true, true, "model erased");          
      }
    }).persist($$.adapter.restful, {collection:'people'});
    obj.erase();

    // model - induce error
    var obj = $$({id:123, name:'Joe Doe'}, {}, {
      'persist:error': function(){
        equals(true, true, "persist:error raised");          
      }
    }).persist($$.adapter.restful, {collection:'NONSENSE'});
    obj.load();

    // model - induce specific error
    var obj = $$({id:123, name:'Joe Doe'}, {}, {
      'persist:load:error': function(){
        equals(true, true, "persist:METHOD:error raised");          
      }
    }).persist($$.adapter.restful, {collection:'NONSENSE'});
    obj.load();

    // container - gather, first syntax
    var proto = $$({}, '<li data-bind="name"></li>',{
      'create': function(){
        if (!this._createCalled) {
          ok(true, "proto 'create' called");
          this._createCalled = true;
        }
      }
    }).persist($$.adapter.restful, {collection:'people'});
    var obj = $$({}, '<ul></ul>', {
      'persist:gather:success': function(event, res){
        equals(this.size(), res.data.length, "container size matches data size");
        equals(this.view.$('li').size(), res.data.length, "view size matches data size");
      }
    }).persist();
    obj.gather(proto, 'append'); // gather

    // container - gather, second syntax
    var proto = $$({}, '<li data-bind="name"></li>', {
      'create': function(){
        if (!this._createCalled) {
          ok(true, "proto 'create' called");
          this._createCalled = true;
        }
      }
    }).persist($$.adapter.restful, {collection:'people'});
    var obj = $$({}, '<div><ul></ul></div>', {
      'persist:gather:success': function(event, res){
        equals(this.size(), res.data.length, "container size matches data size");
        equals(this.view.$('ul li').size(), res.data.length, "view size matches data size");
      }
    }).persist();
    obj.gather(proto, 'append', 'ul'); // gather

    // container - gather, third syntax
    var proto = $$({}, '<li data-bind="name"></li>', {
      'create': function(){
        if (!this._createCalled) {
          ok(true, "proto 'create' called");
          this._createCalled = true;
        }
      }
    }).persist($$.adapter.restful, {collection:'people'});
    var obj = $$({}, '<ul></ul>', {
      'persist:gather:success': function(event, res){
        equals(this.size(), res.data.length, "container size matches data size");
        equals(this.view.$('li').size(), res.data.length, "view size matches data size");
      }
    }).persist();
    obj.gather(proto, 'append', {some:'parameter'}); // gather

    setTimeout(function(){
      start();
    }, 2000);
  });

})(jQuery, agility);

