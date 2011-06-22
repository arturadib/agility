(function($, $$){
  
  // One-liners: one item
  window.hello = $$('Hello World', '<button>${content}</button>', {
    'click root': function(event){
      alert(event);
    }
  });
  $$.document.add(window.hello);

})(jQuery, agility);
