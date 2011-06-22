// One-liners: one item
var hello = $$('Hello World', '<button>${content}</button>', {
  'click root': function(event){
    alert(event);
  }
});
$$.document.add(hello);
