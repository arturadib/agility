(function($, $$){

  module("Persistence");
  
  asyncTest("Server check", function(){
    $.get('/api/', function(res){
      equals(res, 'agility is the way of the future', 'server online');
      start();
    });
  });

  // // No custom view or controller
  // asyncTest("Pure model", function(){
  //   var obj = $$({
  //     a: 1,
  //     _persist: $$.ajax('')
  //   });
  // });
  // 
  // // No custom view or controller
  // asyncTest("Pure tree", function(){
  //   var obj = $$({
  //     a: 1,
  //     _persist: $$.ajax('')
  //   });
  // });

})(jQuery, agility);

