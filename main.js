const express = require('express');
const sqlite3 = require('sqlite3');


const config = require('./config');
const read_file = require('./components/readfile')

var app = express();

//init

/*
var db = new sqlite3.Database('database.sqlite3', function (e) {
    if (err) {
        throw (err);
    }
});
*/
//end init

app.get('/', (req, res) => {
    console.log(req.path);
    res.send("hello");
});

app.get('/r*', (req, res) => {
    console.log("query file with path:"+req.path);
    console.log("and url"+JSON.stringify(req.query));
    var path = './contents'+req.path.substr(2);
    var password = req.query.password ? req.query.password : null;
    var user = req.query.user ? req.query.user : null;
    read_file.read_file(path, { 'password': password, 'user': user }).then(
        data=>{
            console.log(data);
            res.status(200);
            res.send(JSON.stringify(data));
        },reason=>{
            console.log(reason);
            res.status(reason[0]);
            res.send(path+'\n\n\n'+reason[1]);
        }
    );
});

app.listen(config.port, () => {
    console.log('listen on:');
    console.log(config);
})