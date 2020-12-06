const express = require('express');
const sqlite3 = require('sqlite3');
const fs = require('fs').promises;

const config = require('./config');
const read_file = require('./components/readfile');
const { fstat } = require('fs');

var app = express();

//init

/*
var db = new sqlite3.Database('database.sqlite3', function (e) {
    if (err) {
        throw (err);
    }
});
*/

/**
 * don't know why sqlite3 can not use
 *so share func is not avaliable now
 *end init
  */

/**
 * /#/* is for build single_page application
 * /f/* is for get file data
 * /d/* is for download file (if it is a folde, then goto /r/*)
 * /s/* is for share file 
 */

app.get('/f/*', (req, res) => {
    console.log("query file with path:" + req.path);
    console.log("and " + JSON.stringify(req.query));
    var path = './contents' + req.path.substr(2);
    var password = req.query.password ? req.query.password : null;
    var user = req.query.user ? req.query.user : null;
    read_file.read_file(path, { 'password': password, 'user': user }).then(
        data => {
            console.log(data);
            res.status(200).json(data);
        }, reason => {
            console.log(reason);
            res.status(reason[0]).json(reason);
        }
    );
});

app.get('/d/*', (req,res)=>{
    console.log("download file with path:"+req.path);
    console.log("and "+JSON.stringify(req.query));
    var path='./contents'+req.path.substr(2);
    var password = req.query.password ? req.query.password : null;
    var user = req.query.user ? req.query.user : null;
    read_file.read_file(path, { 'password': password, 'user': user }).then(
        data => {
            console.log(data);
            if (data.type=='folder'){
                res.redirect(301,'/r/'+req.path.substr(2));
            }
            res.download(path);
        }, reason => {
            console.log(reason);
            res.status(reason[0]).json(reason);
        }
    );
});

app.get('/', (req, res) => {
    console.log(req.path);
    html = fs.readFile('./index.html', {
        encoding: "utf-8",
        flag: "r"
    }).then(
        data => {
            res.status(200);
            res.type('html');
            res.send(data);
        }, reason => {
            console.log(reason);
            res.status(500).send("Internal server error!");
        }
    );
});

app.get('*',(req,res)=>{
	console.log('404 query\n'+req.path);
	res.status(404).send();
});

app.listen(config.port,config.url, () => {
    console.log('listen on:');
    console.log(config);
})
