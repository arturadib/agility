(function($, $$){


  // --------------------------------
  //
  //  JSHint
  //
  // --------------------------------

  module("JSHint");
  
  test("JSHint", function(){
    var result = JSHINT(window.agilitySource, {proto:true, loopfunc:true});
    var errors = result ? '' : JSHINT.errors;
    equals(errors, '', "JSHint test");
  });

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
  };

  test("No arguments", function(){
    var obj = $$(); // default object
    validateObject( obj );
    ok($.isEmptyObject(obj.model.get()), "model is empty");
  });

  test("Dummy arguments", function(){
    var obj = $$({}, {}, {}); // default object
    validateObject( obj );
    ok($.isEmptyObject(obj.model.get()), "model is empty");
  });

  test("One argument (model object)", function(){
    var obj = $$({
      first: 'Joe',
      last: 'Doe'
    });
    validateObject( obj );
    equals( obj.view.$().text(), '', 'format as expected'); // lib doesn't have a default format for an arbitrary model
  });

  test("Two arguments (model object, view string)", function(){
    var obj = $$({
      first: 'Joe',
      last: 'Doe'
    }, '<div><span data-bind="first"/><span data-bind="last"/></div>');
    validateObject( obj );
    equals( obj.view.$().text(), 'JoeDoe', 'format as expected');
  });
  
  test("Two arguments (model object, view string) with multiple attribute bindings", function(){
    var obj = $$({
      first: 'Joe',
      'la-st': 'Doe',
      name: 'Joe Doe',
      firstColor: 'Red',
      'last-color': 'Blue'
    }, '<div><span data-bind="first, name=name, firstColor=firstColor"/>' +
     '<span data-bind="la-st, name name, last-color last-color"/></div>');
    validateObject( obj );
    equals( obj.view.$().text(), 'JoeDoe', 'format as expected');
    equals( obj.view.$( 'span' ).first().attr( 'name' ), 'Joe Doe', 'format as expected');
    equals( obj.view.$( 'span' ).first().attr( 'firstColor' ), 'Red', 'format as expected');
    equals( obj.view.$( 'span' ).last().attr( 'name' ), 'Joe Doe', 'format as expected');
    equals( obj.view.$( 'span' ).last().attr( 'last-color' ), 'Blue', 'format as expected');
  });
  
  test("Two arguments (model object, view string) with multiple attribute bindings random order", function () {
    var obj = $$({
      first: 'Joe',
      name: 'Joe Doe'
    }, '<div><span data-bind="name=name, first"/>' );
    validateObject( obj );
    equals( obj.view.$().text(), 'Joe', 'format as expected');
    equals( obj.view.$( 'span' ).first().attr( 'name' ), 'Joe Doe', 'format as expected');
  });

  test("Three arguments (model object, view string, controller object)", function(){
    var obj = $$({first:'Joe', last:'Doe'}, '<div><span data-bind="first"/><span data-bind="last"/></div>', {});
    validateObject( obj );
    equals( obj.view.$().text(), 'JoeDoe', 'format as expected');
  });

  test("Three arguments (model object, view string, controller object) with multiple attribute bindings", function(){
    var obj = $$({
      first: 'Joe',
      'la-st': 'Doe',
      name: 'Joe Doe',
      firstColor: 'Red',
      'last-color': 'Blue'
    }, '<div><span data-bind="first, name=name, firstColor=firstColor"/>' +
     '<span data-bind="la-st, name name, last-color last-color"/></div>',
    {});
    validateObject( obj );
    equals( obj.view.$().text(), 'JoeDoe', 'format as expected');
    equals( obj.view.$( 'span' ).first().attr( 'name' ), 'Joe Doe', 'format as expected');
    equals( obj.view.$( 'span' ).first().attr( 'firstColor' ), 'Red', 'format as expected');
    equals( obj.view.$( 'span' ).last().attr( 'name' ), 'Joe Doe', 'format as expected');
    equals( obj.view.$( 'span' ).last().attr( 'last-color' ), 'Blue', 'format as expected');
  });
  
  test("Three arguments (model object, view object, controller object)", function(){
    var obj = $$({first:'Joe', last:'Doe'}, {format:'<div><span data-bind="first"/><span data-bind="last"/></div>', style:'& {float:right; display:none;}'}, {});
    $$.document.append(obj); // necessary for IE
    validateObject( obj );
    equals( obj.view.$().text(), 'JoeDoe', 'format as expected');
    equals( obj.view.$().css('float'), 'right', 'style as expected');
  });
  
  test("Three arguments (model object, view object, controller object) with multiple attribute bindings", function(){
    var obj = $$({
      first: 'Joe',
      'la-st': 'Doe',
      name: 'Joe Doe',
      firstColor: 'Red',
      'last-color': 'Blue'
    }, {format:'<div><span data-bind="first, name=name, firstColor=firstColor"/>' +
     '<span data-bind="la-st, name name, last-color last-color"/></div>',
     style:'& {float:right; display:none;}'},
    {});
    $$.document.append(obj); // necessary for IE & Chrome
    validateObject( obj );
    equals( obj.view.$().text(), 'JoeDoe', 'format as expected');
    equals( obj.view.$( 'span' ).first().attr( 'name' ), 'Joe Doe', 'format as expected');
    equals( obj.view.$( 'span' ).first().attr( 'firstColor' ), 'Red', 'format as expected');
    equals( obj.view.$( 'span' ).last().attr( 'name' ), 'Joe Doe', 'format as expected');
    equals( obj.view.$( 'span' ).last().attr( 'last-color' ), 'Blue', 'format as expected');
    equals( obj.view.$().css('float'), 'right', 'style as expected');
  });
  
  test("One full object argument ({model, view, controller, user_func})", function(){
    var obj = $$({
      model: {
        first: 'Joe',
        last: 'Doe'        
      },
      view: {
        format: '<div><span data-bind="first"/><span data-bind="last"/></div>',
        style: '& {float:right; display:none;}'
      },
      controller: {},
      myFunction: function(){}
    }); // obj
    $$.document.append(obj); // necessary for IE
    validateObject( obj );
    equals( typeof obj.myFunction, 'function', 'user-defined function as expected');
    equals( obj.view.$().text(), 'JoeDoe', 'format as expected');
    equals( obj.view.$().css('float'), 'right', 'style as expected');
  });
  
  test("One full object argument ({model, view, controller, user_func}) with multiple attribute bindings", function(){
    var obj = $$({
      model: {
        first: 'Joe',
        'la-st': 'Doe',
        name: 'Joe Doe',
        firstColor: 'Red',
        'last-color': 'Blue'
      },
      view: {
        format: '<div><span data-bind="first, name=name, firstColor=firstColor"/>' +
                '<span data-bind="la-st, name name, last-color last-color"/></div>',
        style:'& {float:right; display:none;}'
      },
      controller: {},
      myFunction: function(){}
    });
    $$.document.append(obj); // necessary for IE & Chrome
    validateObject( obj );
    equals( typeof obj.myFunction, 'function', 'user-defined function as expected');
    equals( obj.view.$().text(), 'JoeDoe', 'format as expected');
    equals( obj.view.$( 'span' ).first().attr( 'name' ), 'Joe Doe', 'format as expected');
    equals( obj.view.$( 'span' ).first().attr( 'firstColor' ), 'Red', 'format as expected');
    equals( obj.view.$( 'span' ).last().attr( 'name' ), 'Joe Doe', 'format as expected');
    equals( obj.view.$( 'span' ).last().attr( 'last-color' ), 'Blue', 'format as expected');
    equals( obj.view.$().css('float'), 'right', 'style as expected');
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
  
  test("Bind to a controller custom event pre hook", function() {
    var obj = $$({}, '<div/>', {
      'myEvent': function() {
        var l = $$({label: 'myEventLabel'}, '<span data-bind="label"/>');
        this.append(l);
      }
    });
    var ob = $$(obj);
    validateObject(ob);
    ob.bind('pre:myEvent', function() {
      var l = $$({label: 'preHookEvent'}, '<span data-bind="label"/>');
      ob.append(l);
    });
    ob.trigger('myEvent');
    equals( ob.view.$( 'span' ).first().html(), 'preHookEvent', 'preHook event fired');
    equals( ob.view.$( 'span' ).last().html(), 'myEventLabel', 'original event fired');
  });
  
  test("Bind to a controller custom event pre hook event reversal 'has own property bug' regression test", function () {
    var obj = $$({}, '<div/>', {
      'myEvent': function() {
        var l = $$({label: 'myEventLabel'}, '<span data-bind="label"/>');
        this.append(l);
      }
    });
    var ob = $$(obj);
    validateObject(ob);
    ob.bind('pre:myEvent', function() {
      var l = $$({label: 'preHookEvent'}, '<span data-bind="label"/>');
      ob.append(l);
    });
    Array.prototype.__myRandomFunction = function() {
      return 'not own property that will exists on events array';
    };
    ob.trigger('myEvent');
    equals(ob.view.$('span').first().html(), 'preHookEvent', 'preHook event fired');
    equals(ob.view.$('span').last().html(), 'myEventLabel', 'original event fired');
    delete Array.prototype.__myRandomFunction;
    ok(typeof Array.prototype.__myRandomFunction === 'undefined', 'reverted to original Array prototype');
  });
  
  test("Bind to a controller custom event pre hook twice", function() {
    var obj = $$({}, '<div/>', {
      'myEvent': function() {
        var l = $$({label: 'myEventLabel'}, '<span data-bind="label"/>');
        this.append(l);
      }
    });
    var ob = $$(obj);
    validateObject(ob);
    ob.bind('pre:myEvent', function() {
      var l = $$({label: 'preHookEvent'}, '<span data-bind="label"/>');
      ob.append(l);
    });
    ob.bind('pre:myEvent', function() {
      var l = $$({label: 'preHookEventLastFirst'}, '<span data-bind="label"/>');
      ob.append(l);
    });
    //$$.document.append( ob );
    ob.trigger('myEvent');
    equals( ob.view.$( 'span' ).first().html(), 'preHookEventLastFirst', 'last preHook event fired first');
    equals( ob.view.$( 'span' ).eq(1).html(), 'preHookEvent', 'preHook event fired');
    equals( ob.view.$( 'span' ).last().html(), 'myEventLabel', 'original event fired');
  });
  
  test("Bind to a controller custom event post hook", function() {
    var obj = $$({}, '<div/>', {
      'myEvent': function() {
        var l = $$({label: 'myEventLabel'}, '<span data-bind="label"/>');
        this.append(l);
      }
    });
    var ob = $$(obj);
    validateObject(ob);
    ob.bind('post:myEvent', function() {
      var l = $$({label: 'postHookEvent'}, '<span data-bind="label"/>');
      ob.append(l);
    });
    //$$.document.append( ob );
    ob.trigger('myEvent');
    equals( ob.view.$( 'span' ).first().html(), 'myEventLabel', 'original event fired');
    equals( ob.view.$( 'span' ).last().html(), 'postHookEvent', 'postHook event fired');
  });
  
  test("Bind to a controller custom event post hook twice", function() {
    var obj = $$({}, '<div/>', {
      'myEvent': function() {
        var l = $$({label: 'myEventLabel'}, '<span data-bind="label"/>');
        this.append(l);
      }
    });
    var ob = $$(obj);
    validateObject(ob);
    ob.bind('post:myEvent', function() {
      var l = $$({label: 'postHookEvent'}, '<span data-bind="label"/>');
      ob.append(l);
    });
    ob.bind('post:myEvent', function() {
      var l = $$({label: 'postHookEventLastLast'}, '<span data-bind="label"/>');
      ob.append(l);
    });
    //$$.document.append( ob );
    ob.trigger('myEvent');
    equals( ob.view.$( 'span' ).first().html(), 'myEventLabel', 'original event fired');
    equals( ob.view.$( 'span' ).eq(1).html(), 'postHookEvent', 'postHook event fired');
    equals( ob.view.$( 'span' ).last().html(), 'postHookEventLastLast', 'last postHook event fired last');
  });
  
  test("Destroy propagates to children", function() {
    var destroyTriggered = false;
    var childDestroyTriggered = false;
    var grandchildDestroyTriggered = false;
    var greatgrandchildDestroyTriggered = false;
    var obj = $$({}, '<div/>', {
      'destroy': function() {
        destroyTriggered = true; 
      }
    });
    var child = $$({}, '<div/>', {
      'destroy': function() {
        childDestroyTriggered = true;
      }
    });
    var grandchild = $$({}, '<div/>', {
      'destroy': function() {
        grandchildDestroyTriggered = true;
      }
    });
    var greatgrandchild = $$({}, '<div/>', {
      'destroy': function() {
        greatgrandchildDestroyTriggered = true;
      }
    });
    obj.append( child );
    child.append( grandchild );
    grandchild.append( greatgrandchild );
    obj.destroy();
    ok(destroyTriggered, "destroy triggered");
    ok(childDestroyTriggered, "child destroy triggered");
    ok(grandchildDestroyTriggered, "grandchild destroy triggered");
    ok(greatgrandchildDestroyTriggered, "great grandchild destroy triggered");
  });
  
  test("Extend controller syntax from four arguments (prototype, model, view, controller object)", function() {
    var lbl = $$({}, '<span data-bind="label"/>');
    var partial = $$({}, '<div/>', {
      'create': function() {
        var l = $$(lbl, {label: this.model.get('label')});
        this.append(l);
      },
      'myEvent': function() {
        var l = $$(lbl, {label: this.model.get('myEventLabel')});
        this.append(l);
      }
    });
    var complete = $$(partial, {}, {}, {
      '~create': function() {
        var value = $$(lbl, {label: this.model.get('value')});
        this.append(value);
      },
      '~myEvent': function() {
        var value = $$(lbl, {label: this.model.get('myEventValue')});
        this.append(value);
      }
    });
    var first = $$(complete, {label:"firstLabel", value:"firstValue"});
    var second = $$(complete, {label:"secondLabel", value:"secondValue"});
    validateObject(first);
    validateObject(second);
    equals(first.view.$('span').length, 2, 'appended both labels');
    equals(first.view.$('span').first().text(), 'firstLabel', 'executed partial create');
    equals(first.view.$('span').last().text(), 'firstValue', 'executed extended create');
    equals(second.view.$('span').length, 2, 'appended both labels');
    equals(second.view.$('span').first().text(), 'secondLabel', 'executed partial create');
    equals(second.view.$('span').last().text(), 'secondValue', 'executed extended create');
    
    first.model.set({myEventLabel: "myEventLabel", myEventValue: "myEventValue"});
    first.trigger('myEvent');
    equals(first.view.$('span').length, 4, 'appended all from myEvent chain');
    equals(first.view.$('span').eq(2).text(), 'myEventLabel', 'executed partial myEvent');
    equals(first.view.$('span').eq(3).text(), 'myEventValue', 'executed extended myEvent');
    
    var doubleExtend = $$(complete, {}, {}, {
      '~create': function() {
        var doub = $$(lbl, {label: this.model.get('doubleExtension')});
        this.append(doub);
      }
    });
    var dExtend = $$(doubleExtend, {label:"firstLabel",value:"extendedOnce",doubleExtension:"extendedTwice"});
    validateObject(dExtend);
    equals(dExtend.view.$('span').length, 3, 'appended labels from three chained create events');
    equals(dExtend.view.$('span').first().text(), 'firstLabel', 'executed first create');
    equals(dExtend.view.$('span').eq(1).text(), 'extendedOnce', 'executed second create');
    equals(dExtend.view.$('span').last().text(), 'extendedTwice', 'executed third create');
    
    var differential = $$(partial, {}, {}, {
      'create': function() {
        var value = $$(lbl, {label: this.model.get('value')});
        this.append(value);
      },
      'myEvent': function() {
        var l = $$(lbl, {label: this.model.get('myEventDifferential')});
        this.append(l);
      }
    });
    var third = $$(differential, {label:"thirdLabel",value:"thirdValue"});
    validateObject(third);
    equals(third.view.$('span').length, 1, 'only one child');
    equals(third.view.$('span').first().text(), 'thirdValue', 'initialized from overriden create');
    
    third.model.set({myEventDifferential: "myEventDifferential"});
    third.trigger('myEvent');
    equals(third.view.$('span').length, 2, 'appended via myEvent');
    equals(third.view.$('span').last().text(), 'myEventDifferential', 'executed from overrident myEvent');
    
    var nakedExtend = $$({}, '<div/>', {
      '~create': function(){
        var l = $$(lbl, {label: this.model.get('label')});
        this.append(l);
      }
    });
    var fourth = $$(nakedExtend, {label:"fourthLabel"});
    validateObject(fourth);
    equals(fourth.view.$('span').first().text(), 'fourthLabel', 'naked ~create collapsed correctly to "create"');
  });
  
  test("Extend controller syntax for change events from four arguments (prototype, model, view, controller object)", function() {
    var lbl = $$({}, '<span data-bind="label"/>');
    var partial = $$({}, '<div/>', {
      'change:label': function() {
        var l = $$(lbl, {label: this.model.get('label')});
        this.append(l);
      }
    });
    var complete = $$(partial, {}, {}, {
      '~change:label': function() {
        var value = $$(lbl, {label: this.model.get('value')});
        this.append(value);
      }
    });
    var first = $$(complete, {label:"firstLabel", value:"firstValue"});
    validateObject(first);
    first.model.set({label: "newLabel"});
    equals(first.view.$('span').length, 2, 'appened label and value');
    equals(first.view.$('span').first().text(), 'newLabel', 'executed partial change:label');
    equals(first.view.$('span').last().text(), 'firstValue', 'executed extended change:label');
    
    var doubleExtend = $$(complete, {}, {}, {
      '~change:label': function() {
        var doub = $$(lbl, {label: this.model.get('doubleExtension')});
        this.append(doub);
      }
    });
    var dExtend = $$(doubleExtend, {label:"firstLabel",value:"extendedOnce",doubleExtension:"extendedTwice"});
    validateObject(dExtend);
    dExtend.model.set({label: "newLabel"});
    equals(dExtend.view.$('span').length, 3, 'appended labels from three chained change:label events');
    equals(dExtend.view.$('span').first().text(), 'newLabel', 'executed first change:label');
    equals(dExtend.view.$('span').eq(1).text(), 'extendedOnce', 'executed second change:label');
    equals(dExtend.view.$('span').last().text(), 'extendedTwice', 'executed third change:label');
    
    var differential = $$(partial, {}, {}, {
      'change:label': function() {
        var value = $$(lbl, {label: this.model.get('value')});
        this.append(value);
      }
    });
    var third = $$(differential, {label:"thirdLabel",value:"thirdValue"});
    validateObject(third);
    third.model.set({label: "newLabel"});
    equals(third.view.$('span').length, 1, 'only one child');
    equals(third.view.$('span').first().text(), 'thirdValue', 'initialized from overriden change:label');
    
    var nakedExtend = $$({}, '<div/>', {
      '~change:label': function(){
        var l = $$(lbl, {label: this.model.get('label')});
        this.append(l);
      }
    });
    var fourth = $$(nakedExtend, {label:"fourthLabel"});
    validateObject(fourth);
    fourth.model.set({label: "newLabel"});
    equals(fourth.view.$('span').first().text(), 'newLabel', 'naked ~change:label collapsed correctly to "change:label"');
  });
  
  test("Extend controller syntax from single object argument ({ ..., controller: ...})", function() {
    var lbl = $$({}, '<span data-bind="label"/>');
    var partial = $$({}, '<div/>', {
      'create': function() {
        var l = $$(lbl, {label: this.model.get('label')});
        this.append(l);
      },
      'myEvent': function() {
        var l = $$(lbl, {label: this.model.get('myEventLabel')});
        this.append(l);
      }
    });
    var complete = $$(partial, {
      controller:{
        '~create': function() {
          var value = $$(lbl, {label: this.model.get('value')});
          this.append(value);
        },
        '~myEvent': function() {
          var value = $$(lbl, {label: this.model.get('myEventValue')});
          this.append(value);
        }
      }
    });
    var first = $$(complete, {label:"firstLabel", value:"firstValue"});
    var second = $$(complete, {label:"secondLabel", value:"secondValue"});
    validateObject(first);
    validateObject(second);
    equals(first.view.$('span').length, 2, 'appended both labels');
    equals(first.view.$('span').first().text(), 'firstLabel', 'executed partial create');
    equals(first.view.$('span').last().text(), 'firstValue', 'executed extended create');
    equals(second.view.$('span').length, 2, 'appended both labels');
    equals(second.view.$('span').first().text(), 'secondLabel', 'executed partial create');
    equals(second.view.$('span').last().text(), 'secondValue', 'executed extended create');
    
    first.model.set({myEventLabel: "myEventLabel", myEventValue: "myEventValue"});
    first.trigger('myEvent');
    equals(first.view.$('span').length, 4, 'appended all from myEvent chain');
    equals(first.view.$('span').eq(2).text(), 'myEventLabel', 'executed partial myEvent');
    equals(first.view.$('span').eq(3).text(), 'myEventValue', 'executed extended myEvent');
    
    var doubleExtend = $$(complete, {
      controller:{
        '~create': function() {
          var doub = $$(lbl, {label: this.model.get('doubleExtension')});
          this.append(doub);
        }
      }
    });
    var dExtend = $$(doubleExtend, {label:"firstLabel",value:"extendedOnce",doubleExtension:"extendedTwice"});
    validateObject(dExtend);
    equals(dExtend.view.$('span').length, 3, 'appended labels from three chained create events');
    equals(dExtend.view.$('span').first().text(), 'firstLabel', 'executed first create');
    equals(dExtend.view.$('span').eq(1).text(), 'extendedOnce', 'executed second create');
    equals(dExtend.view.$('span').last().text(), 'extendedTwice', 'executed third create');
    
    var differential = $$(partial, {
      controller: {
        'create': function() {
          var value = $$(lbl, {label: this.model.get('value')});
          this.append(value);
        },
        'myEvent': function() {
          var l = $$(lbl, {label: this.model.get('myEventDifferential')});
          this.append(l);
        }
      }
    });
    var third = $$(differential, {label:"thirdLabel",value:"thirdValue"});
    validateObject(third);
    equals(third.view.$('span').length, 1, 'only one child');
    equals(third.view.$('span').first().text(), 'thirdValue', 'initialized from overriden create');
    
    third.model.set({myEventDifferential: "myEventDifferential"});
    third.trigger('myEvent');
    equals(third.view.$('span').length, 2, 'appended via myEvent');
    equals(third.view.$('span').last().text(), 'myEventDifferential', 'executed from overrident myEvent');
    
    var nakedExtend = $$({
      controller: {
        '~create': function() {
          var l = $$(lbl, {label: this.model.get('label')});
          this.append(l);
        }
      }
    });
    var fourth = $$(nakedExtend, {label:"fourthLabel"});
    validateObject(fourth);
    equals(fourth.view.$('span').first().text(), 'fourthLabel', 'naked ~create collapsed correctly to "create"');
        
    var ran1 = false, ran2 = false;
    var DOMextend1 = $$({}, '<button/>', {
      'click &': function(){
        ran1 = true;
      }
    });
    var DOMextend2 = $$(DOMextend1, {}, {}, {
      '~click &': function(){
        ran2 = true;
      }
    });
    DOMextend2.view.$().click();
    ok(ran1, 'first DOM handler OK');
    ok(ran2, 'second DOM handler OK');
  });
  
  test("Extend controller syntax for change events from single object argument ({ ..., controller: ...})", function() {
    var lbl = $$({}, '<span data-bind="label"/>');
    var partial = $$({}, '<div/>', {
      'change:label': function() {
        var l = $$(lbl, {label: this.model.get('label')});
        this.append(l);
      }
    });
    var complete = $$(partial, {
      controller: {
        '~change:label': function() {
          var value = $$(lbl, {label: this.model.get('value')});
          this.append(value);
        }
      }
    });
    var first = $$(complete, {label:"firstLabel", value:"firstValue"});
    validateObject(first);
    first.model.set({label: "newLabel"});
    equals(first.view.$('span').length, 2, 'appened label and value');
    equals(first.view.$('span').first().text(), 'newLabel', 'executed partial change:label');
    equals(first.view.$('span').last().text(), 'firstValue', 'executed extended change:label');
    
    var doubleExtend = $$(complete, {
      controller: {
        '~change:label': function() {
          var doub = $$(lbl, {label: this.model.get('doubleExtension')});
          this.append(doub);
        }
      }
    });
    var dExtend = $$(doubleExtend, {label:"firstLabel",value:"extendedOnce",doubleExtension:"extendedTwice"});
    validateObject(dExtend);
    dExtend.model.set({label: "newLabel"});
    equals(dExtend.view.$('span').length, 3, 'appended labels from three chained change:label events');
    equals(dExtend.view.$('span').first().text(), 'newLabel', 'executed first change:label');
    equals(dExtend.view.$('span').eq(1).text(), 'extendedOnce', 'executed second change:label');
    equals(dExtend.view.$('span').last().text(), 'extendedTwice', 'executed third change:label');
    
    var differential = $$(partial, {
      controller: {
        'change:label': function() {
          var value = $$(lbl, {label: this.model.get('value')});
          this.append(value);
        }
      }
    });
    var third = $$(differential, {label:"thirdLabel",value:"thirdValue"});
    validateObject(third);
    third.model.set({label: "newLabel"});
    equals(third.view.$('span').length, 1, 'only one child');
    equals(third.view.$('span').first().text(), 'thirdValue', 'initialized from overriden change:label');
    
    var nakedExtend = $$({
      controller: {
        '~change:label': function(){
          var l = $$(lbl, {label: this.model.get('label')});
          this.append(l);
        }
      }
    });
    var fourth = $$(nakedExtend, {label:"fourthLabel"});
    validateObject(fourth);
    fourth.model.set({label: "newLabel"});
    equals(fourth.view.$('span').first().text(), 'newLabel', 'naked ~change:label collapsed correctly to "change:label"');
  });


  test("Multiple event controller binding", function(){
    var numCalls = 0;
    var obj1 = $$({
      controller:{
        'event1;event2;  event3': function(){
          numCalls += 1;
        }
      }
    });
    obj1.trigger('event1');
    obj1.trigger('event2');
    obj1.trigger('event3');
    equals( numCalls, 3, 'all three events ran controller code');

    var obj2 = $$({
      view:{
        format: '<div id="main"><div id="button1" /><div id="button2"/><div class="button3" /></div>'
      },
      controller:{
        'click #button1:not(.disabled), div#button2; dblclick div#main .button3; mouseover &': function(){
          numCalls += 1;
        }
      }
    });
    obj2.view.$('#button1').click();
    obj2.view.$('#button2').click();
    obj2.view.$('.button3').dblclick();
    obj2.view.$().mouseover();

    equals( numCalls, 7, 'all four events ran controller code');

  });

  test("Object inheritance", function(){
    var objBase = $$({}, {format:'<div><span data-bind="first"/>.<span data-bind="last"/></div>', style:'& {float:right; display:none;}'});
    var objNewModel = {first:'Joe', last:'Doe'};
    var objNew = $$(objBase, objNewModel);
    $$.document.append(objNew);
    
    ok($.isEmptyObject(objBase.model.get()), "parent model untouched ("+JSON.stringify(objBase.model.get())+")");
    equals(objBase.view.$().text(), '.', "parent html untouched");
    equals(objNew.model.get('first'), objNewModel.first, "child model OK");
    equals(objNew.view.$().text(), 'Joe.Doe', "child html OK");
    ok(objNew.view.$().hasClass('agility_'+objBase._id), "child CSS class inherited OK");
    equals(objNew.view.$().css('float'), 'right', "child style OK");
    
    // this should trigger a 404 error if format is parsed to the DOM
    objBase = $$({}, "<div class='test'> <img data-bind='src path'/> </div>");
    equals(objBase.model.size(), 0, 'model is empty');
    objNew = $$(objBase, {path:'http://google.com/favicon.ico'});
    equals(objNew.view.$('img').attr('src'), 'http://google.com/favicon.ico', 'img src correctly set');
  });
  
  test("Null one-way binding", function(){
    var obj = $$({content: null}, {format:'<div data-bind="content"></div>'});
    $$.document.append(obj);
    
    equals(obj.view.$().text(), '', "null data-bind OK");
  });
  
  test("Empty string one-way binding", function(){
    var obj = $$({txt:"I'm text from a model"}, '<div data-bind="txt"/>');
    $$.document.append(obj);
    obj.model.set({'txt':''});
    
    equals(obj.view.$().text(), '', "empty string data-bind OK");
  });

  test("Agility prototype model string property immutability", function() {
    var obj = $$({}, '<div></div>');
    obj.model.set({immutableValue:'immutable'});
    var extendedObj = $$(obj, {
      controller: {
        'create': function() {
          var iV = this.model.get('immutableValue');
          iV = 'mutable';
        } // create
      } // controller
    }); // extendedObj
    deepEqual(obj.model.get('immutableValue'), 'immutable', 'prototype model should be immutable');
    
    extendedObj.model.set({immutableValue:'mutable'});
    
    $$.document.append(extendedObj);
    
    deepEqual(obj.model.get('immutableValue'), 'immutable', 'prototype model should be immutable');
    
    var obj2 = $$({}, '<div></div>');
    obj2.model.set({immutableValue:'immutable'});
    var extendedObj2 = $$(obj2,{
      model: {immutableValue: 'not immutable'},
      controller: {
        'create': function() {
          var iV = this.model.get('immutableValue');
          iV = 'mutable';
        } // create
      } // controller 
    }); // extendedObj2
    deepEqual(obj2.model.get('immutableValue'), 'immutable', 'prototype model should be immutable');
    
    extendedObj2.model.set({immutableValue: 'mutable'});
    
    $$.document.append(extendedObj2);
    
    deepEqual(obj2.model.get('immutableValue'), 'immutable', 'prototype model should be immutable');
  });
  
  test("Agility prototype model array property immutability", function() {
    var obj = $$({}, '<div></div>');
    obj.model.set({immutableValue: ['immutable']});
    var extendedObj = $$(obj, {
      controller: {
        'create': function() {
          var iV = this.model.get('immutableValue');
          iV.push('mutability');
        } // create
      } // controller
    }); // extendedObj
    deepEqual(obj.model.get('immutableValue'), ['immutable'], 'prototype model should be immutable');
    
    extendedObj.model.set({immutableValue: ['not immutable']});
    
    $$.document.append(extendedObj);
    
    deepEqual(obj.model.get('immutableValue'), ['immutable'], 'prototype model should be immutable');
    
    var obj2 = $$({}, '<div></div>');
    obj2.model.set({immutableValue: ['immutable']});
    var extendedObj2 = $$(obj2, {
      model: {immutableValue: ['not immutable']},
      controller: {
        'create': function() {
          var iV = this.model.get('immutableValue');
          iV.push('mutability');
        } // create
      } // controller
    }); // extendedObj2
    deepEqual(obj2.model.get('immutableValue'), ['immutable'], 'prototype model should be immutable');
    
    extendedObj2.model.set({immutableValue: ['not immutable']});
    
    $$.document.append(extendedObj2);
    
    deepEqual(obj2.model.get('immutableValue'), ['immutable'], 'prototype model should be immutable');
  });
  
  test("Agility prototype model object property immutability", function() {
    var obj = $$({}, '<div></div>');
    obj.model.set({immutableValue: {i: 'immutable'}});
    var extendedObj = $$(obj, {
      controller: {
        'create': function() {
          var iV = this.model.get('immutableValue');
          iV.i = 'mutable' ;
        } // create
      } // controller
    }); // extendedObj
    deepEqual(obj.model.get('immutableValue'), {i: 'immutable'}, 'prototype model should be immutable');
    
    extendedObj.model.set({immutableValue: {i: 'mutable'}});
    
    $$.document.append(extendedObj);
    
    deepEqual(obj.model.get('immutableValue'), {i: 'immutable'}, 'prototype model should be immutable');
    
    var obj2 = $$({}, '<div></div>');
    obj2.model.set({immutableValue: {i: 'immutable'}});
    var extendedObj2 = $$(obj2, {
      model: {immutableValue: {i: 'not immutable'}},
      controller: {
        'create': function() {
          var iV = this.model.get('immutableValue');
          iV.i = 'mutable' ;
        } // create
      } // controller
    }); // extendedObj2
    deepEqual(obj2.model.get('immutableValue'), {i: 'immutable'}, 'prototype model should be immutable');
    
    extendedObj2.model.set({immutableValue: {i: 'mutable'}});
    
    $$.document.append(extendedObj2);
    
    deepEqual(obj2.model.get('immutableValue'), {i: 'immutable'}, 'prototype model should be immutable');
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

  test("Container calls", function(){
    var obj1 = $$({}, '<div><span class="here"></span></div>');
    var obj2 = $$({ text: 'hello' }, '<div data-bind="text"/>');
    obj1.append(obj2, '.here');
    equals(obj1.view.$('.here div').html(), 'hello', 'append() appends at given selector');

    obj1 = $$({}, '<div><span></span></div>');
    obj2 = $$({ text: 'hello' }, '<div data-bind="text"/>'); // default format should have a <div> root
    obj1.append(obj2);
    equals(obj1.view.$('span').next().html(), 'hello', 'append() appends at root element');        

    obj1 = $$({}, '<div><ul/></div>');
    obj2 = $$({ text: 'hello' }, '<div data-bind="text"/>'); // default format should have a <div> root
    obj1.prepend(obj2);
    equals(obj1.view.$('ul').prev().html(), 'hello', 'prepend() prepends at root element');        

    obj1 = $$({}, '<div><ul><span/></ul></div>');
    obj2 = $$({ text: 'hello' }, '<div data-bind="text"/>'); // default format should have a <div> root
    obj1.prepend(obj2, 'ul');
    equals(obj1.view.$('ul span').prev().html(), 'hello', 'prepend() prepends at given selector');        

    obj1 = $$({}, '<div><ul><li id="a"/> <li id="b"/></ul></div>');
    obj2 = $$({ text: 'hello' }, '<div data-bind="text"/>'); // default format should have a <div> root
    obj1.before(obj2, '#b');
    equals(obj1.view.$('ul li#a').next().html(), 'hello', 'before() inserts correctly');

    obj1 = $$({}, '<div><ul><li id="a"/> <li id="b"/></ul></div>');
    obj2 = $$({ text: 'hello' }, '<div data-bind="text"/>'); // default format should have a <div> root
    obj1.after(obj2, '#a');
    equals(obj1.view.$('ul li#a').next().html(), 'hello', 'after() inserts correctly');

    obj1 = $$({}, '<div><span></span></div>');
    for (var i=0;i<10;i++) {
      obj2 = $$({text: 'hello'}, '<div class="test" data-bind="text"></div>'); // default format should have a <div> root
      obj1.append(obj2, 'span');
    }
    equals(obj1.size(), 10, 'correct container size()');
    equals(obj1.view.$('.test').size(), 10, 'correct DOM size');

    var flag = false;
    var count = 0;
    obj1.each(function(){
      if (this.model.get('text') !== 'hello') flag = true;
      count++;
    });
    equals(flag, false, 'each() works');
    equals(count, 10, 'each() works');
    
    obj1.empty();
    equals(obj1.size(), 0, 'empty() works');
  });

  test("Model calls", function(){
    var a_change = false;
    var t = false;
    var obj1 = $$({a:1}, '<div data-bind="text"></div>', {
      'change:a': function(){
        a_change = true;
      },
      'change:text': function(){
        t = true;
      }
    });
    obj1.model.set({text:'Joe Doe'});
    equals(obj1.model.get('a'), 1, 'obj.model.set() extends by default');
    equals(obj1.view.$().text(), 'Joe Doe', 'obj.model.set() fires view change');
    equals(t, true, 'obj.model.set() fires change:var');
    a_change = false;
    obj1.model.set({text:'New Text'}, {reset:true});
    equals(obj1.model.get('a'), undefined, 'obj.model.set() resets OK');
    equals(a_change, true, 'obj.model.set() with reset=true fires change:a');
    
    obj1.model.reset();
    equals(obj1.model.get('a'), 1, 'obj.model.reset() brings back original attribute');
    equals(obj1.model.get('text'), undefined, 'obj.model.reset() erases non-original attributes');
  });

  test("Chainable calls", function(){
    t = false;
    var obj = $$().model.set({text:'Joe Doe'}).bind('click &', function(){ t = true; }).trigger('click &');
    equals(t, true, 'chaining set(), bind(), and trigger()');
  });

  test("Two-way bindings", function(){    
    var obj = $$({name:'Mary'}, "<input type='text' data-bind='name' />");
    equals(obj.view.$().val(), 'Mary', 'text input: binding properly initialized');
    obj.model.set({name:'Joe Doe'});
    equals(obj.view.$().val(), 'Joe Doe', 'text input: Model --> DOM binding OK');
    obj.view.$().val('Art Blakey').change();
    equals(obj.model.get('name'), 'Art Blakey', 'text input: DOM --> Model binding OK');
    
    // 'text' should be the default input type as per dom spec
    obj = $$({name:'Mary'}, "<input data-bind='name' />");
    equals(obj.view.$().val(), 'Mary', 'text input: binding properly initialized');
    obj.model.set({name:'Joe Doe'});
    equals(obj.view.$().val(), 'Joe Doe', 'text input: Model --> DOM binding OK');
    obj.view.$().val('Art Blakey').change();
    equals(obj.model.get('name'), 'Art Blakey', 'text input: DOM --> Model binding OK');

    var obj = $$({name:'Mary'}, "<input type='search' data-bind='name' />");
    equals(obj.view.$().val(), 'Mary', 'search input: binding properly initialized');
    obj.model.set({name:'Joe Doe'});
    equals(obj.view.$().val(), 'Joe Doe', 'search input: Model --> DOM binding OK');
    // can't test these synchronously as current implementation uses a 50ms timeout
    // obj.view.$().val('Joe Doee').keypress();
    // equals(obj.model.get('name'), 'Joe Doee', 'search input: DOM --> Model binding OK');

    obj = $$({a:true}, "<input type='checkbox' data-bind='a' />");
    equals(obj.view.$().prop('checked'), true, 'checkbox input: binding properly initialized');
    obj.model.set({a:false});
    equals(obj.view.$().prop("checked"), false, 'checkbox input: Model --> DOM binding OK');
    obj.view.$().prop('checked', true).change();
    equals(obj.model.get('a'), true, 'checkbox input: DOM --> Model binding OK');

    obj = $$({opt:'opt-b'}, "<div><input type='radio' name='test' data-bind='opt' value='opt-a' id='a'/> a<br/> <input type='radio' name='test' data-bind='opt' value='opt-b' id='b'/> b</div>");
    equals(obj.view.$('input#b').prop("checked"), true, 'radio input: binding properly initialized');
    obj.model.set({opt:'opt-a'});
    equals(obj.view.$('input#a').prop("checked"), true, 'radio input: Model --> DOM binding OK');
    obj.view.$('input#b').prop('checked', true).change();
    equals(obj.model.get('opt'), 'opt-b', 'radio input: DOM --> Model binding OK');

    obj = $$({opt:'opt-b'}, "<select data-bind='opt'> <option value='opt-a'/> <br/> <option value='opt-b'/> </select>");
    equals(obj.view.$().val(), 'opt-b', 'select input: binding properly initialized');
    obj.model.set({opt:'opt-a'});
    equals(obj.view.$().val(), 'opt-a', 'select input: Model --> DOM binding OK');
    obj.view.$().val('opt-b').change();
    equals(obj.model.get('opt'), 'opt-b', 'select input: DOM --> Model binding OK');
  });
  
  test("Two-way bindings with extra one-way bound attributes", function(){
    var obj = $$({name:'Mary',myAttr:'myAttr'}, "<input type='text' data-bind='name, myAttr myAttr' />");
    equals(obj.view.$().val(), 'Mary', 'text input: binding properly initialized');
    equals(obj.view.$().attr('myAttr'), 'myAttr', 'extra attribute set');
    obj.model.set({name:'Joe Doe'});
    equals(obj.view.$().val(), 'Joe Doe', 'text input: Model --> DOM binding OK');
    equals(obj.view.$().attr('myAttr'), 'myAttr', 'extra attribute set');
    obj.view.$().val('Art Blakey').change();
    equals(obj.model.get('name'), 'Art Blakey', 'text input: DOM --> Model binding OK');

    var obj = $$({name:'Mary',myAttr:'myAttr'}, "<input type='search' data-bind='name, myAttr myAttr' />");
    equals(obj.view.$().val(), 'Mary', 'search input: binding properly initialized');
    equals(obj.view.$().attr('myAttr'), 'myAttr', 'extra attribute set');
    obj.model.set({name:'Joe Doe'});
    equals(obj.view.$().val(), 'Joe Doe', 'search input: Model --> DOM binding OK');
    equals(obj.view.$().attr('myAttr'), 'myAttr', 'extra attribute set');
    // can't test these synchronously as current implementation uses a 50ms timeout
    // obj.view.$().val('Joe Doee').keypress();
    // equals(obj.model.get('name'), 'Joe Doee', 'search input: DOM --> Model binding OK');

    obj = $$({a:true,myAttr:'myAttr'}, "<input type='checkbox' data-bind='a, myAttr myAttr' />");
    equals(obj.view.$().prop('checked'), true, 'checkbox input: binding properly initialized');
    equals(obj.view.$().attr('myAttr'), 'myAttr', 'extra attribute set');
    obj.model.set({a:false});
    equals(obj.view.$().prop("checked"), false, 'checkbox input: Model --> DOM binding OK');
    equals(obj.view.$().attr('myAttr'), 'myAttr', 'extra attribute set');
    obj.view.$().prop('checked', true).change();
    equals(obj.model.get('a'), true, 'checkbox input: DOM --> Model binding OK');

    obj = $$({opt:'opt-b',myAttr:'myAttr'}, "<div><input type='radio' name='test' data-bind='opt, myAttr myAttr' value='opt-a' id='a'/> a<br/> <input type='radio' name='test' data-bind='opt' value='opt-b' id='b'/> b</div>");
    equals(obj.view.$('input#b').prop("checked"), true, 'radio input: binding properly initialized');
    equals(obj.view.$('input#a').attr('myAttr'), 'myAttr', 'extra attribute set');
    equals(obj.view.$('input#b').attr('myAttr'), null, 'no extra attribute set');
    obj.model.set({opt:'opt-a'});
    equals(obj.view.$('input#a').prop("checked"), true, 'radio input: Model --> DOM binding OK');
    equals(obj.view.$('input#a').attr('myAttr'), 'myAttr', 'extra attribute set');
    equals(obj.view.$('input#b').attr('myAttr'), null, 'no extra attribute set');
    obj.view.$('input#b').prop('checked', true).change();
    equals(obj.model.get('opt'), 'opt-b', 'radio input: DOM --> Model binding OK');

    obj = $$({opt:'opt-b',myAttr:'myAttr'}, "<select data-bind='opt, myAttr myAttr'> <option value='opt-a'/> <br/> <option value='opt-b'/> </select>");
    equals(obj.view.$().val(), 'opt-b', 'select input: binding properly initialized');
    equals(obj.view.$().attr('myAttr'), 'myAttr', 'extra attribute set');
    obj.model.set({opt:'opt-a'});
    equals(obj.view.$().val(), 'opt-a', 'select input: Model --> DOM binding OK');
    equals(obj.view.$().attr('myAttr'), 'myAttr', 'extra attribute set');
    obj.view.$().val('opt-b').change();
    equals(obj.model.get('opt'), 'opt-b', 'select input: DOM --> Model binding OK');
  });

  // ----------------------------------------------
  //
  //  Post-builder - Custom controller methods
  //
  // ----------------------------------------------

  module("Post-builder - Custom controller methods");

  test("Container events", function(){
    var o = {};
    var s = '';
    var obj1 = $$();
    var obj2 = $$({
      controller: {
        append: function(ev, $$o, selector){
          o = $$o;
          s = selector;
        }
      }
    });  
    obj2.append(obj1, 'sel');
    ok(o===obj1 && s==='sel', "append() called");
  });

  test("Agility event bubbling", function(){
      var parent1Called = false;
      var parent2Called = false;
      var parent1 = $$({
        controller: {
          'child:testevent': function(){
            parent1Called = true;
          }
        }
      });
      var parent2 = $$({
        controller: {
          'child:testevent': function(){
            parent2Called = true;
          }
        }
      });
      var obj = $$();
      parent1.append(parent2);
      parent2.append(obj);
      obj.trigger('testevent')
      ok(parent1Called, "event bubbled to parent 1");
      ok(parent2Called, "event bubbled to parent 2");
  });

  test("Model events", function(){
    var t = false;
    var obj = $$({}, {}, {
      'change': function(){
        t = true;
      }
    });
    obj.model.set({a:'hello'});
    ok(t===true, "change fired");
  });

  test("DOM events", function(){
    var t = false;
    var obj = $$({ text: 'hello' }, '<div><button>${text}</button></div>', {
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
    obj = $$({ text: 'hello' }, '<button>${text}</button>', {
      'click &': function(event){
        t = true;
      }
    });
    obj.view.$().trigger('click');
    ok(t===true, "root click event caught");
  });
  
  test("isAgility utility method", function() {
    var obj = { some: 'object' };
    equals($$.isAgility(obj), false, 'non-agility object should return false');
    
    obj = 'some string';
    equals($$.isAgility(obj), false, 'string should return false');
    
    obj = 17;
    equals($$.isAgility(obj), false, 'number should return false');
    
    obj = $$( {}, '<div/>' );
    equals($$.isAgility(obj), true, 'agility object should return true');
  });

})(jQuery, agility);

