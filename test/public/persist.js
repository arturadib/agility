(function($, $$){

  module("Persistence");
  
  asyncTest("Server check", function(){
    $.get('/api/', function(res){
      equals(res, 'agility is the way of the future', 'server online');
      start();
    });
  });

  // asyncTest("Pure model", function(){
  //   var obj = $$({name:'Joe Doe'}).persist({collection:'people'});
  // });  

  asyncTest("Pure container", function(){
    var proto = $$({}, '<li data-bind="name"></li>').persist($$.adapter.restful, {collection:'people'});
    var obj = $$({}, '<ul></ul>', {
      'persist:success': function(event, res){
        equals(this.size(), res.data.length, "container size matches data size");
        equals(this.view.$('li').size(), res.data.length, "view size matches data size");
        start();
      }
    });
    obj.gather(proto);    
  });

})(jQuery, agility);

