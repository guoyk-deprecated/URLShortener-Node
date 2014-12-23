'use strict'

var crypto = require('crypto');

var pg = require('pg');

var ENV = process.env;

var dbHost     = ENV['PG_HOST']       || ENV['POSTGRES_PORT_5432_TCP_ADDR']       || 'localhost';
var dbPort     = ENV['PG_PORT']       || ENV['POSTGRES_PORT_5432_TCP_PORT']       || 5432;
var dbUser     = ENV['PG_USER']       || ENV['POSTGRES_ENV_POSTGRES_USER']        || 'postgres';
var dbPassword = ENV['PG_PASSWORD']   || ENV['POSTGRES_ENV_POSTGRES_PASSWORD']    || '';
var dbDatabase = ENV['PG_DATABASE']   || dbUser;

var conUrl = "postgres://" + dbUser + ":" + dbPassword + "@" + dbHost + ":" + dbPort + "/" + dbDatabase;

// SQLs

var sqlInitTest   = "SELECT * FROM pg_catalog.pg_tables WHERE tablename = 'urls' AND schemaname = 'public';";
var sqlInitCreate = "CREATE TABLE urls (id BIGSERIAL PRIMARY KEY, lurl TEXT NOT NULL, hash_md5 CHAR(32) NOT NULL, hash_sha1 CHAR(40) NOT NULL); CREATE INDEX ON urls (hash_md5, hash_sha1);";
var sqlQueryLong  = "SELECT lurl FROM urls WHERE id = $1;";
var sqlQueryShort = "SELECT id FROM urls WHERE hash_md5 = $1 AND hash_sha1 = $2;";
var sqlCreate     = "INSERT INTO urls (lurl, hash_md5, hash_sha1) VALUES ($1, $2, $3) RETURNING id;";

//Check and init database

pg.connect(conUrl, function(err, client, done) {
  client.query(sqlInitTest, function(err, result) {
    if (result.rowCount > 0) {
      console.log("Database Exists.");
      done();
    } else {
      console.log("Creating Database...");
      client.query(sqlInitCreate, function(err, result) {
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
    client.query(sqlQueryLong, [surl], function(err, result) { 
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
    client.query(sqlQueryShort, [md5, sha1], function(err, result) {
      var row = result.rows[0];
      if (row != null) {
        callback(null, row);
        done();
      } else {
        client.query(sqlCreate, [lurl, md5, sha1], function(err, result) {
          var id = result.rows[0].id;
          console.log("New Record:", id,"=", lurl);
          callback(null, id);
          done();
        });
      }
    });
  });

};
