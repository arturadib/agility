

// !!!!!


// CREATE CHECKBOXES FOR EACH PICTURE TO DO BATCH-ERASE PICS


var pic = $$({ 
  view: {
    template: '<div><img src="${src}"/> <button id="destroy">X</button></div>',
    style: '& { position:relative; border:1px solid black; float:left; width:100px; height:100px; margin-right:10px; margin-bottom:10px; text-align:center; } \
            & > img { max-width:100px; max-height:100px; } \
            & > button#destroy { display:none; position:absolute; top:3px; right:3px; }'
  },
  controller: {
    // DOM events
    'mouseenter &': function(){
      this.view.$('button#destroy').show();
    },
    'mouseleave &': function(){
      this.view.$('button#destroy').hide();
    },
    'click button#destroy': function(){
      this.destroy();
    }
  }
});

var app = $$({
  view: {
    template: '<div>\
                 <button id="add">Add picture</button> \
                 <div id="list"/> \
               </div>', 
    style: '& { margin-top:20px; width:500px; margin-left:auto; margin-right:auto; }  \
            & > #add { font-size:150%; } \
            & > #list { margin-top:20px; }'
  },
  controller: {
    'click button#add': function(){
      var newPic = $$(pic, {src:"http://www.publicdomainpictures.net/pictures/5000/nahled/1-1252593298WHAn.jpg"});
      this.add(newPic, '#list');
    }
  }
});

$$.document.add(app);
