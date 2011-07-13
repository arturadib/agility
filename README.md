# AGILITY.JS
Agility.js is Javascript MVC for the *write less, do more* programmer. 

Main site: http://arturadib.github.com/agility

Write **maintainable** browser code without compromising on **development speed**. Here's a fully functional To-Do app in 17 lines:

    var item = $$({}, '<li><span data-bind="content"/> <button>x</button></li>', '& span { cursor:pointer; }', {
      'click span': function(){
        var input = prompt('Edit to-do item:', this.model.get('content'));
        if (!input) return;
        this.model.set({content:input});
      },
      'click button': function(){
        this.destroy();
      }
    });
    var list = $$({}, '<div> <button id="new">New item</button> <ul></ul> </div>', {
      'click #new': function(){
        var newItem = $$(item, {content:'Click to edit'});
        this.add(newItem, 'ul'); // add to container, appending at <ul>
      }
    })    
    $$.document.add(list);

Curious to learn more? Visit: http://arturadib.github.com/agility or fork ahead and contribute code!
