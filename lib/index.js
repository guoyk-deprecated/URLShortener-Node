'use strict'

var express = require('express');
var parser  = require('body-parser');
var service = require('./service');

var app = express();

//Convert short url to long url

app.get('/:short', function(req, res) {
  var surl = req.param('short');

  service.short2Long(surl, function(err, lurl) {
    res.send('<html><head><title>IsZero</title><script>setTimeout(function(){ window.location = "' + lurl + '";}, 2000)</script></head><body><h4>Redirecting...</h4></body>');
  });

});

//Parse body and convert long url to short url

app.use(parser.urlencoded({ extended: true}));

app.post('/create', function(req, res) {
  var lurl = req.body.lurl;

  service.long2Short(lurl, function(err, surl) {
    res.json({ surl: surl });
  });
});

//Serve static assets

app.use(express.static('public'));

app.listen(3000);
