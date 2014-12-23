'use strict'

var url     = require('url');

var express = require('express');
var parser  = require('body-parser');
var service = require('./service');

var app = express();

//Convert short url to long url

app.get('/:short', function(req, res, next) {
  var surl = req.param('short');
  var code = service.shortStr2Int(surl);

  service.short2Long(code, function(err, lurl) {
    if(lurl == null) return next();
    var loc = lurl.replace("\"", "%22");
    res.send('<html><head><title>IsZero</title><script>setTimeout(function(){ window.location = "' + loc + '";}, 2000)</script></head><body><h4>Redirecting...</h4></body></html>');
  });

});

//Parse body and convert long url to short url

app.use(parser.urlencoded({ extended: true}));

app.post('/create', function(req, res) {
  var lurl = req.body.lurl;
  if(lurl == null) return res.json({ err: 2 });
  var parsed = url.parse(lurl);
  if(parsed.protocol == null) return res.json({ err: 3 });

  service.long2Short(lurl, function(err, surl) {
    var code = service.int2ShortStr(surl);
    if (code == -1) {
      res.json({ err: 1 });
    } else {
      res.json({ err:0, surl: code });
    }
  });
});

//Serve static assets

app.use(express.static(__dirname + '/public/'));

//404
app.use(function(req, res) {
  res.status(404).send('<html><head><title>Not Found</title></head><body><h4>Not Found</h4></body></html>');
});

app.listen(3000);
