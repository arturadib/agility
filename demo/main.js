// One-liners: one item
var hello = $$('Hello World', '<div>${content} <span id="aa"></span></div>');
hello.add( $$('hi there', '${content}'), '#aa' );
$$.document.add(hello);
setTimeout(function(){
  hello.model({content: "mamma"}); // setter: calls change(), which by default maps to render(), which by default uses $.tmpl()
}, 2000);
