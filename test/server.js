//
// Node.js server for Agility unit tests
//

var express = require('express');
var port = 8222;

var app = express.createServer();
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

var data = [{id:'123', name:'Joe Doe'}, {id:'1', name:'John Smith'}, {id:'2', name:'Zoe Doe'}];

//
// GET /api
// 
app.get('/api', function(req, res){
  res.send('agility is the way of the future');
});

//
// GET /api/people
//
app.get('/api/people', function(req, res){
  res.send(data);
});

//
// GET /api/people/id
//
app.get('/api/people/:id', function(req, res){
  var _id = req.params.id;
  var _data = {};
  data.forEach(function(el){
    if (el.id === _id) {
      _data = el;
      return;
    }
  });
  res.header('Content-Type', 'text/html'); // tries to fool library to see if it's robust against wrong content-type
  res.send(_data);
});

//
// PUT /api/people/:id
//
app.put('/api/people/:id', function(req, res){
  var entry = req.body;
  entry.id = req.params.id;

  // response
  res.send({}, 200);
});

//
// DELETE /api/people/:id
//
app.del('/api/people/:id', function(req, res){
  // response
  res.send({}, 200);
});

//
// POST /api/people
//
app.post('/api/people', function(req, res){
  var entry = req.body;
  entry.id = 123;

  // response
  // res.header('Location', 'http://localhost:'+port+'/api/people/'+entry.id);
  // res.send({}, 201);
  res.send({id:entry.id}, 201); // 201 == Created
});

app.listen(port);

console.log('Listening on port '+port);
