//
// Node.js server for Agility unit tests
//

var express = require('express');
var port = 8222;

var app = express.createServer();
app.use(app.router);
app.use(express.static(__dirname + '/public'));

//
// Entry point
//
app.get('/api', function(req, res){
  res.send('agility is the way of the future');
});

app.listen(port);

console.log('Listening on port '+port);
