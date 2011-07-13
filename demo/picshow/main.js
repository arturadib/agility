
var pic = $$({ 
  // Custom
  checked: false,
  
  view: {
    format: '<div>\
                <div id="opts"> <input type="checkbox" id="check"/> <button id="destroy">X</button> </div>\
                <div id="img-container"> <img data-bind="src path"/> </div> \
             </div>',
    style: '& { float:left; margin-right:40px; margin-bottom:20px; width:100px; } \
            & div#opts { } \
            & input#check { float:left; } \
            & button#destroy { float:right; } \
            & div#img-container { clear:both; border:1px solid black; width:100px; height:100px; text-align:center; } \
            & img { max-width:100px; max-height:100px; }'
  },
  
  controller: {
    'click img': function(){
      this.view.$('input#check').click();
    },
    'click button#destroy': function(){
      this.destroy();
    },
    'change input#check': function(event){
      this.checked = $(event.target).prop('checked');
    }    
  }
});

var app = $$({
  view: {
    format: '<div> \
               <button id="add">Add picture</button> \
               <div id="list"/> \
             </div>', 
    style: '& { margin-top:20px; width:600px; margin-left:auto; margin-right:auto; }  \
            & > #add { font-size:120%; } \
            & > #list { margin-top:20px; }'
  },
  controller: {
    'click button#add': function(){
      var newPic = $$(pic, {path:"http://www.publicdomainpictures.net/pictures/5000/nahled/1-1252593298WHAn.jpg"});
      this.add(newPic, '#list');
    }
  }
});

$$.document.add(app);
