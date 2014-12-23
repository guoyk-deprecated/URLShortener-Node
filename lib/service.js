'use strict'

var crypto = require('crypto');

var pg = require('pg');

var DB_HOST     = 'localhost';
var DB_USER     = 'yanke';
var DB_PASSWORD = '';
var DB_PORT     = 5432;
var DB_DATABASE = 'yanke';

var conUrl = "postgres://" + DB_USER + ":" + DB_PASSWORD + "@" + DB_HOST + ":" + DB_PORT + "/" + DB_DATABASE;

var INIT_TEST_SQL   = "SELECT * FROM pg_catalog.pg_tables WHERE tablename = 'urls' AND schemaname = 'public';";
var INIT_CREATE_SQL = "CREATE TABLE urls (id BIGSERIAL PRIMARY KEY, lurl TEXT NOT NULL, hash_md5 CHAR(32) NOT NULL, hash_sha1 CHAR(40) NOT NULL); CREATE INDEX ON urls (hash_md5, hash_sha1);";

//Check and init database

pg.connect(conUrl, function(err, client, done) {
  client.query(INIT_TEST_SQL, function(err, result) {
    if (result.rowCount > 0) {
      console.log("Database Exists.");
      done();
    } else {
      console.log("Creating Database...");
      client.query(INIT_CREATE_SQL, function(err, result) {
        console.log("Done.");
        done();
      });
    }
  });
});

//Providing Service

var service = exports = module.exports;

service.short2Long = function(surl, callback) {

  pg.connect(conUrl, function(err, client, done) {
    client.query("SELECT lurl FROM urls WHERE id = $1;", [surl], function(err, result) { 
      var row = result.rows[0];
      if (row != null) {
        callback(null, row.lurl);
      } else {
        callback(null, null);
      }
      done();
    });
  });

};

service.long2Short = function(lurl, callback) {
  var sha1 = crypto.createHash('sha1').update(lurl, 'utf8').digest('hex');
  var md5  = crypto.createHash('md5').update(lurl, 'utf8').digest('hex');

  pg.connect(conUrl, function(err, client, done) {
    client.query("SELECT id FROM urls WHERE hash_md5 = $1 AND hash_sha1 = $2;", [md5, sha1], function(err, result) {
      var row = result.rows[0];
      if (row != null) {
        callback(null, row);
        done();
      } else {
        client.query("INSERT INTO urls (lurl, hash_md5, hash_sha1) VALUES ($1, $2, $3) RETURNING id;", [lurl, md5, sha1], function(err, result) {
          var id = result.rows[0].id;
          console.log("New Record:", id,"=", lurl);
          callback(null, id);
          done();
        });
      }
    });
  });

};
