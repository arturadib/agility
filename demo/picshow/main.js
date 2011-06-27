

// !!!!!


// CREATE CHECKBOXES FOR EACH PICTURE TO DO BATCH-ERASE PICS


var pic = $$({}, 
  '<div><img/></div>',
  '& { border:1px; float:left; width:100px; height:100px; margin-right:10px; margin-bottom:10px;}  & > img { max-width:100px; max-height:100px; }', 
  {
    create: function(){
      if (this.get('src')) {
        this.view.$('img').attr('src', this.get('src'));
      }
    },
    'mouseenter :root': function(){
      console.log('entered')
    },
    'mouseleave :root': function(){
      console.log('left')
    }
  }
);

var app = $$({
  model: {},
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
