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
app.get('/api/select', function(req, res){
  var cookie = JSON.parse( req.cookies['aws-credentials'] );
  var creds = { keyid:cookie.keyid, secret:cookie.secret };
  var sdb = new simpledb.SimpleDB(creds);  

  sdb.select(req.query.queryStr, function(_err, _res, _meta){
    res.send(_res);
  });
});

app.listen(port);

console.log('Listening on port '+port);
