(function($, $$){

  module("Persistence");
  
  asyncTest("Server check", function(){
    $.get('/api/', function(res){
      equals(res, 'agility is the way of the future', 'server online');
      start();
    });
  });

  asyncTest("Model - create", function(){
    var obj = $$({name:'Joe Doe'}, {}, {
      'persist:save:success': function(){
        equals(this.model.get('id'), 123, "model created");          
        start();
      }
    }).persist($$.adapter.restful, {collection:'people'});
    obj.save();
  });

  asyncTest("Model - update", function(){
    var obj = $$({id:123, name:'Joe Doe'}, {}, {
      'persist:save:success': function(){
        equals(true, true, "model updated");
        start();
      }
    }).persist($$.adapter.restful, {collection:'people'});
    obj.save();
  });

  asyncTest("Model - load", function(){
    var obj = $$({id:123}, {}, {
      'persist:load:success': function(){
        equals(this.model.get('name'), 'Joe Doe', "model loaded");          
        start();
      }
    }).persist($$.adapter.restful, {collection:'people'});
    obj.load();
  });

  asyncTest("Model - erase", function(){
    var obj = $$({id:123, name:'Joe Doe'}, {}, {
      'persist:erase:success': function(){
        equals(true, true, "model erased");          
        start();
      }
    }).persist($$.adapter.restful, {collection:'people'});
    obj.erase();
  });

  asyncTest("Model - induce error", function(){
    var obj = $$({id:123, name:'Joe Doe'}, {}, {
      'persist:error': function(){
        equals(true, true, "persist:error raised");          
        start();
      }
    }).persist($$.adapter.restful, {collection:'NONSENSE'});
    obj.load();
  });

  asyncTest("Model - induce specific error", function(){
    var obj = $$({id:123, name:'Joe Doe'}, {}, {
      'persist:load:error': function(){
        equals(true, true, "persist:METHOD:error raised");          
        start();
      }
    }).persist($$.adapter.restful, {collection:'NONSENSE'});
    obj.load();
  });

  asyncTest("Container - gather, first syntax", function(){
    var proto = $$({}, '<li data-bind="name"></li>').persist($$.adapter.restful, {collection:'people'});
    var obj = $$({}, '<ul></ul>', {
      'persist:gather:success': function(event, res){
        equals(this.size(), res.data.length, "container size matches data size");
        equals(this.view.$('li').size(), res.data.length, "view size matches data size");
        start();
      }
    }).persist();
    obj.gather(proto, 'append'); // gather
  });

  asyncTest("Container - gather, second syntax", function(){
    var proto = $$({}, '<li data-bind="name"></li>').persist($$.adapter.restful, {collection:'people'});
    var obj = $$({}, '<div><ul></ul></div>', {
      'persist:gather:success': function(event, res){
        equals(this.size(), res.data.length, "container size matches data size");
        equals(this.view.$('ul li').size(), res.data.length, "view size matches data size");
        start();
      }
    }).persist();
    obj.gather(proto, 'append', 'ul'); // gather
  });

  asyncTest("Container - gather, third syntax", function(){
    var proto = $$({}, '<li data-bind="name"></li>').persist($$.adapter.restful, {collection:'people'});
    var obj = $$({}, '<ul></ul>', {
      'persist:gather:success': function(event, res){
        equals(this.size(), res.data.length, "container size matches data size");
        equals(this.view.$('li').size(), res.data.length, "view size matches data size");
        start();
      }
    }).persist();
    obj.gather(proto, 'append', {some:'parameter'}); // gather
  });

})(jQuery, agility);

