# Agility.js
http://agility.js

Agility.js is Javascript MVC for the *write less, do more* programmer.

Agility lets you write **maintainable** browser code without compromising on **productivity**. Write fully functional apps in fewer lines, like this minimal To-Do app (17 lines of code):

    //
    // Item prototype
    //
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
    //
    // List of items
    //
    var list = $$({}, '<div> <button id="new">New item</button> <ul></ul> </div>', {
      'click #new': function(){
        var newItem = $$(item, {content:'Click to edit'});
        this.add(newItem, 'ul'); // add to container, appending at <ul>
      }
    });
    $$.document.add(list);

Curious to learn more? 

Visit http://agilityjs.org or fork the project and commit away - contributors are always welcome!
