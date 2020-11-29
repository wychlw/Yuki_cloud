const express = require('express');
const sqlite3 = require('sqlite3');
const config = require('./config');
const fs = require('fs').promises;
const crypto = require('crypto');
const { resolve } = require('path');
const { promises } = require('fs');

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

//read file

function get_pass() {
    /**
     * haven't written yet.
     */
    return 'test_password';
}

function check_auth(user_auth, file_auth) {
    return new Promise(function (resolve, reject) {
        switch (file_auth[0]) {
            case 'all':
                resolve([200, 'success!']);

            case 'password':
                if (user_auth == null || user_auth[1] != 'password') reject([403, 'maybe a password,please?']);
                let hash = crypto.createHash('sha256');
                let input_pass_hash = hash.update(user_auth[2]).digest().toString('base64');
                if (input_pass_hash == file_auth[1]) resolve([200, 'success!']);
                reject([403, 'wrong password! do you know the password?']);

            case 'user':
                if (user_auth == null) reject([500, 'no auth_data']);
                if (user_auth[1] != 'user') reject([500, 'wrong auth way']);
                for (var i of user_auth) {
                    for (var j of file_auth) {
                        if (i == j && i!='user') resolve([200, 'success!']);
                    }
                }
                reject([403, 'no authority']);

            default:
                reject([500, 'I don\'t know what happened, but something must be wrong', user_auth, file_auth]);
        }
    });
}

function read_file(path, auth = [null]) {
    /**
     * 1. read the file info
     * 2. user authorization
     */

    //path.substr(0,path.lastIndexOf('/',path.length-2)+1): access upper folder
    return fs.readFile(path.substr(0, path.lastIndexOf('/', path.length - 2) + 1) + 'Yuki_config.json', {
        encoding: "utf-8",
        flag: "r"
    }).then(
        data => {

            folder_data = JSON.parse(data);

            let split_path = path.split('/')
            var file = split_path.pop();
            if (file == '') file = split_path.pop();

            which_file = -1;
            for (let i in folder_data['file']) {
                if (folder_data['file'][i]['name'] == file) which_file = i;
            }
            if (which_file == -1) return Promise.reject(['no such file!', 404]);

            return check_auth(auth, folder_data['file'][which_file]['access']);

        }, reason => {
            return Promise.reject(reason);
        }
    ).then(
        data => {
            if (folder_data['file'][which_file]['type'] == 'folder') {
                return fs.readFile(path + 'Yuki_config.json', {
                    encoding: "utf-8",
                    flag: "r"
                });
            }
            return Promise.resolve(null);
        },
        reason => {
            return Promise.reject(reason);
        }
    ).then(
        data=>{
            var file_data=folder_data['file'][which_file];
            delete file_data.access;
            if (data!=null){
                var file_data_add=JSON.parse(data);
                for (var i in file_data_add) file_data[i]=file_data_add[i];
                for (var i of file_data['file']) delete i.access;
            }
            return Promise.resolve(file_data);
        },reason=>{
            return Promise.reject(reason);
        }
    )
}

//end read file

read_file('./contents/test2.md', [[],'password', 'test_password2']).then(
    data => {
        console.log(data);
    }, reason => {
        console.log(reason);
    }
);
