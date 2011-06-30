(function($, $$){

  // --------------------------------
  //
  //  Builder
  //
  // --------------------------------

  module("Object builder");

  var validateObject = function(o){
    ok( !$.isEmptyObject(o.model), "obj.model defined");
    ok( !$.isEmptyObject(o.view), "obj.view defined");    
    ok( !$.isEmptyObject(o.controller), "obj.controller defined");    
  }

  test("No arguments", function(){
    var obj = $$(); // default object
    validateObject( obj );
    ok($.isEmptyObject(obj.get()), "model is empty");
  });

  test("Dummy arguments", function(){
    var obj = $$({}, {}, {}); // default object
    validateObject( obj );
    ok($.isEmptyObject(obj.get()), "model is empty");
  });

  test("One argument (model string)", function(){
    var obj = $$('Joe Doe');
    validateObject( obj );
    equals( obj.view.$().html(), 'Joe Doe', 'format as expected');
  });

  test("One argument (model object)", function(){
    var obj = $$({
      first: 'Joe',
      last: 'Doe'
    });
    validateObject( obj );
    equals( obj.view.$().text(), '', 'format as expected'); // lib doesn't have a default format for an arbitrary model
  });

  test("Two arguments (model, view string)", function(){
    var obj = $$('Joe Doe', '<div data-bind="text"></div>');
    validateObject( obj );
    equals( obj.view.$().text(), 'Joe Doe', 'format as expected');
  });

  test("Two arguments (model object, view string)", function(){
    var obj = $$({
      first: 'Joe',
      last: 'Doe'
    }, '<div><span data-bind="first"/> <span data-bind="last"/></div>');
    validateObject( obj );
    equals( obj.view.$().text(), 'Joe Doe', 'format as expected');
  });

  test("Three arguments (model string, view string, controller object)", function(){
    var obj = $$('Joe Doe', '<div data-bind="text"></div>', {
      init: function(){
        this.view.render();
      }
    });
    validateObject( obj );
    equals( obj.view.$().text(), 'Joe Doe', 'format as expected');
  });

  test("Three arguments (model object, view string, controller object)", function(){
    var obj = $$({first:'Joe', last:'Doe'}, '<div><span data-bind="first"/> <span data-bind="last"/></div>', {
      init: function(){
        this.view.render();
      }
    });
    validateObject( obj );
    equals( obj.view.$().text(), 'Joe Doe', 'format as expected');
  });

  test("Three arguments (model string, view object, controller object)", function(){
    var obj = $$('Joe Doe', 
      {
        format:'<div data-bind="text"></div>', 
        style:'& { color:rgb(255, 0, 0); }' 
      }, 
      {
        init: function(){
          this.view.render();
          this.view.stylize();
        }
      }
    );
    validateObject( obj );
    equals( obj.view.$().text(), 'Joe Doe', 'format as expected');
    equals( obj.view.$().css('color'), 'rgb(255, 0, 0)', 'style as expected');
  });

  test("Three arguments (model object, view object, controller object)", function(){
    var obj = $$({first:'Joe', last:'Doe'}, {format:'<div><span data-bind="first"/> <span data-bind="last"/></div>', style:'& { color:rgb(255, 0, 0); }'}, {
      init: function(){
        this.view.render();
        this.view.stylize();
      }
    });
    validateObject( obj );
    equals( obj.view.$().text(), 'Joe Doe', 'format as expected');
    equals( obj.view.$().css('color'), 'rgb(255, 0, 0)', 'style as expected');
  });
  
  test("One full object argument ({model || view || controller})", function(){
    var obj = $$({
      model: {
        first: 'Joe',
        last: 'Doe'        
      },
      view: {
        format: '<div><span data-bind="first"/> <span data-bind="last"/></div>',
        style: '& { color:rgb(255, 0, 0); }'
      },
      controller: {}
    }); // obj
    validateObject( obj );
    equals( obj.view.$().text(), 'Joe Doe', 'format as expected');
    equals( obj.view.$().css('color'), 'rgb(255, 0, 0)', 'style as expected');
  });
  
  test("Auto-proxying", function(){
    var t = {}, t2 = {};
    var obj = $$({}, {}, {
      test: function(){
        t = this;
      }
    });    
    obj.controller.test.call({});
    equals( t, obj, 'auto-proxying obj.controller.*' );    
    // Not doing this test yet as it requires a function factory (e.g. obj.fn()) to do auto-proxying!
    // obj.fn('test2', function(){ t2 = this; });
    // obj.test2.call({});
    // equals( t2, obj, 'auto-proxying obj.*' );

    t = {}; t2 = {};
    obj = $$({}, {}, {
      test: (function(){
        var fn = function(){ t = this; };
        fn._noProxy = true;
        return fn;
      })()
    });
    var o2 = {};
    obj.controller.test.call(o2);
    equals( t, o2, '_noProxy obj.controller.*' );
    // Not doing this test yet as it requires a function factory (e.g. obj.fn()) to do auto-proxying!
    // obj.fn('test2', function(){ t2 = this; });
    // obj.test2.call(o2);
    // equals( t2, o2, '_noProxy obj.*' );
  });
  
  test("Object inheritance", function(){
    var objBase = $$({}, {format:'<div><span data-bind="first"/> <span data-bind="last"/></div>', style:'& { color:rgb(255, 0, 0); }'});
    var objNewModel = {first:'Joe', last:'Doe'};
    var objNew = $$(objBase, objNewModel);

    ok($.isEmptyObject(objBase.get()), "parent model untouched ("+JSON.stringify(objBase.get())+")");
    equals(objBase.view.$().text(), ' ', "parent html untouched");
    equals(objNew.get('first'), objNewModel.first, "child model OK");
    equals(objNew.view.$().text(), 'Joe Doe', "child html OK");
    ok(objNew.view.$().hasClass('agility_'+objBase._id), "child CSS class inherited OK");
    equals(objNew.view.$().css('color'), 'rgb(255, 0, 0)', "child style OK");

    // this should trigger a 404 error if format is parsed to the DOM
    objBase = $$({}, "<div class='test'> <img data-bind='path src'/> </div>");
    equals(objBase.model.size(), 0, 'model is empty');
    objNew = $$(objBase, {path:'http://google.com/favicon.ico'});
    equals(objNew.view.$('img').attr('src'), 'http://google.com/favicon.ico', 'img src correctly set');
  });


  // ----------------------------------------------
  //
  //  Post-builder - Overriding default controller
  //
  // ----------------------------------------------

  module("Post-builder - Overriding default controller methods");

  // ------------------------------------
  //
  //  Post-builder - Default controller
  //
  // ------------------------------------

  module("Post-builder - Default controller");

  test("Tree calls", function(){
    var obj1 = $$({}, '<div><span class="here"></span></div>');
    var obj2 = $$('hello');
    obj1.add(obj2, '.here');
    equals(obj1.view.$('.here div').html(), 'hello', 'add() appends at given selector');

    obj1 = $$({}, '<div><span></span></div>');
    obj2 = $$('hello'); // default format should have a <div> root
    obj1.add(obj2);
    equals(obj1.view.$('span').next().html(), 'hello', 'add() appends at root element');        

    obj1 = $$({}, '<div><span></span></div>');
    for (var i=0;i<10;i++) {
      obj2 = $$('hello', '<div class="test"></div>'); // default format should have a <div> root
      obj1.add(obj2, 'span');
    }
    equals(obj1.tree.size(), 10, 'correct tree.size()');
    equals(obj1.view.$('.test').size(), 10, 'correct DOM size');
  });

  test("Model calls", function(){
    var t = false;
    var obj1 = $$({a:1}, '<div data-bind="text"></div>', {
      'modelChange:text': function(){
        t = true;
      }
    });
    obj1.set({text:'Joe Doe'});
    equals(obj1.model.get('a'), 1, 'obj.set() extends by default');
    equals(obj1.view.$().text(), 'Joe Doe', 'obj.set() fires view change');
    equals(t, true, 'obj.set() fires modelChange:var');
    obj1.set({text:'New Text'}, {reset:true});
    equals(obj1.model.get('a'), undefined, 'obj.set() resets OK');    
  });

  test("Chainable calls", function(){
    t = false;
    var obj = $$().set({text:'Joe Doe'}).bind('click &', function(){ t = true; }).trigger('click &');
    equals(t, true, 'chaining set(), bind(), and trigger()');
  });

  test("Two-way bindings", function(){
    var obj = $$({name:'Mary'}, "<input type='text' data-bind='name' />");
    equals(obj.view.$().val(), 'Mary', 'text input: binding properly initialized');
    obj.set({name:'Joe Doe'});
    equals(obj.view.$().val(), 'Joe Doe', 'text input: Model --> DOM binding OK');
    obj.view.$().val('Art Blakey').change();
    equals(obj.get('name'), 'Art Blakey', 'text input: DOM --> Model binding OK');

    obj = $$({a:true}, "<input type='checkbox' data-bind='a' />");
    equals(obj.view.$().prop('checked'), true, 'checkbox input: binding properly initialized');
    obj.set({a:false});
    equals(obj.view.$().prop("checked"), false, 'checkbox input: Model --> DOM binding OK');
    obj.view.$().prop('checked', true).change();
    equals(obj.get('a'), true, 'checkbox input: DOM --> Model binding OK');

    obj = $$({opt:'opt-b'}, "<div><input type='radio' name='test' data-bind='opt' value='opt-a' id='a'/> a<br/> <input type='radio' name='test' data-bind='opt' value='opt-b' id='b'/> b</div>");
    equals(obj.view.$('input#b').prop("checked"), true, 'radio input: binding properly initialized');
    obj.set({opt:'opt-a'});
    equals(obj.view.$('input#a').prop("checked"), true, 'radio input: Model --> DOM binding OK');
    obj.view.$('input#b').prop('checked', true).change();
    equals(obj.get('opt'), 'opt-b', 'radio input: DOM --> Model binding OK');

    obj = $$({opt:'opt-b'}, "<select data-bind='opt'> <option value='opt-a'/> <br/> <option value='opt-b'/> </select>");
    equals(obj.view.$().val(), 'opt-b', 'select input: binding properly initialized');
    obj.set({opt:'opt-a'});
    equals(obj.view.$().val(), 'opt-a', 'select input: Model --> DOM binding OK');
    obj.view.$().val('opt-b').change();
    equals(obj.get('opt'), 'opt-b', 'select input: DOM --> Model binding OK');
  });

  // ----------------------------------------------
  //
  //  Post-builder - Custom controller methods
  //
  // ----------------------------------------------

  module("Post-builder - Custom controller methods");

  test("Tree events", function(){
    var o = {};
    var s = '';
    var obj1 = $$();
    var obj2 = $$({
      controller: {
        add: function(ev, $$o, selector){
          o = $$o;
          s = selector;
        }
      }
    });  
    obj2.add(obj1, 'sel');
    ok(o===obj1 && s==='sel', "add() called");
  });

  test("Model events", function(){
    var t = false;
    var obj = $$({}, {}, {
      modelChange: function(){
        t = true;
      }
    });
    obj.set({a:'hello'});
    ok(t===true, "modelChange() called");
  });

  test("DOM events", function(){
    var t = false;
    var obj = $$('hello', '<div><button>${text}</button></div>', {
      'click button': function(event){
        t = true;
      }
    });
    obj.view.$('button').trigger('click');
    ok(t===true, "click event caught");
    
    t = false;
    obj.view.$('span').trigger('click');
    ok(t===false, "click event properly filtered selector");

    t = false;
    obj = $$('hello', '<button>${text}</button>', {
      'click &': function(event){
        t = true;
      }
    });
    obj.view.$().trigger('click');
    ok(t===true, "root click event caught");
  });

})(jQuery, agility);

