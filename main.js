// One-liners: one item
var hello = $$('Hello World', '<div>${content}</div>'); // == $$({content:'Hello World'}, '<div>${content}</div>');
$$.document.add(hello); // two things: 1) $$.document._tree.hello now exists; 2) $$.document's add() handler will by default append given element to <body>
// hello.model({content: "mamma"}); // setter: calls change(), which by default maps to render(), which by default uses $.tmpl()
