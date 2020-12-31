const crypto = require('crypto');
const fs = require('fs').promises;
const fs_sync = require('fs');

const config = require('./../config');
const user_system = require('./user_system');

const read_file = {

    'folder_data': null,
    'which_file': null,
    'salt': config.salt,

    check_auth(user_auth, file_auth) {
        return new Promise(function (resolve, reject) {

            var ret = [403, { 'wrong_password': false, 'invalid_user': false }, ""];

            if (file_auth.password) {
                if (user_auth.password) {
                    let hash = crypto.createHash('sha256');
                    let input_pass = user_auth.password + this.salt;
                    let input_pass_hash = hash.update(input_pass).digest().toString('base64');
                    if (input_pass_hash == file_auth.password) resolve([200, 'success!']);
                }

                ret[1].wrong_password = true;
                ret[2] += " Wrong password!";
            }

            if (file_auth.user) {
                if (user_auth.user) {
                    for (var j of file_auth.user) {
                        if (user_auth.user.name == j) {
                            let info = user_system.valid(user_auth.user.name, user_auth.user.token);
                            if (info[0] == 200) {
                                resolve([200, 'success!']);
                            }
                        }

                    }
                }

                ret[1].invalid_user = true;
                ret[2] += "  Invalid user!";
            }

            if ((!file_auth.password) && (!file_auth.user)) {
                resolve([200, 'success!']);
            }

            reject(ret);
        });
    },

    read_file(path, auth = {}) {

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

                this.folder_data = JSON.parse(data);

                let split_path = path.split('/')
                var file = split_path.pop();
                if (file == '') file = split_path.pop();

                this.which_file = -1;
                for (let i in this.folder_data['file']) {
                    if (this.folder_data['file'][i]['name'] == file) this.which_file = i;
                }
                if (this.which_file == -1) return Promise.reject([404, 'no such file!']);

                return this.check_auth(auth, this.folder_data['file'][this.which_file]['access']);

            }, reason => {
                return Promise.reject(reason);
            }
        ).then(
            data => {
                if (this.folder_data['file'][this.which_file]['type'] == 'folder') {
                    return fs.readFile(path + '/Yuki_config.json', {
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
            data => {
                var file_data = this.folder_data.file[this.which_file];
                delete file_data.access;
                if (data != null) {
                    var file_data_add = JSON.parse(data);
                    for (let i in file_data_add) {
                        file_data[i] = file_data_add[i];
                    }
                    for (let i of file_data.file) {
                        i.valid = {};
                        if (i.access.user) {
                            i.valid.user = i.access.user;
                        }
                        if (i.access.password) {
                            i.valid.password = true;
                        }
                        delete i.access;
                    }
                }
                return Promise.resolve(file_data);
            }, reason => {
                return Promise.reject(reason);
            }
        );
    },

    upload_file(path, file, file_info = {}, auth = {}, file_auth = {}) {
        return fs.readFile(path.substr(0, path.lastIndexOf('/', path.length - 2) + 1) + 'Yuki_config.json', {
            encoding: "utf-8",
            flag: "r"
        }).then(
            data => {

                var folder_data = JSON.parse(data);

                let split_path = path.split('/')
                var folder = split_path.pop();
                if (folder == '') folder = split_path.pop();

                let which_folder = -1;
                for (let i in folder_data['file']) {
                    if (folder_data['file'][i]['name'] == folder) which_folder = i;
                }
                if (which_folder == -1) return Promise.reject([404, 'no such folder!']);

                return this.check_auth(auth, folder_data['file'][which_folder]['access']);
            }, reason => {
                return Promise.reject(reason);
            }
        ).then(
            data => {

                file.pipe(fs_sync.createWriteStream(path + file_info.file_name));

                return fs.readFile(path + 'Yuki_config.json', {
                    encoding: "utf-8",
                    flag: "r"
                }, reason => {
                    return Promise.reject(reason);
                }).then(data => {

                    var folder_data=JSON.parse(data);

                    let my_date = new Date();
                    let time_now = my_date.getTime();
                    let time_num = Number(time_now);

                    var access = {};
                    if (file_auth.user && file_auth.user.length > 0) {
                        access.user = file_auth.user;
                    }
                    if (file_auth.password && file_auth.password != '') {
                        access.password = file_auth.password;
                    }

                    folder_data.file.push({
                        'name': file_info.file_name,
                        'type': 'file',
                        'last_modification_time': time_num,
                        'access': access
                    });

                    folder_data.file_num=folder_data.file.length;

                    return fs.writeFile(path + 'Yuki_config.json', JSON.stringify(folder_data), {
                        encoding: "utf-8",
                        flag: "w"
                    });

                }, reason => {
                    return Promise.reject(reason);

                });

            }
        );

    },

    create_folder(path, name, auth = {}, folder_auth = {}) {
        return fs.readFile(path.substr(0, path.lastIndexOf('/', path.length - 2) + 1) + 'Yuki_config.json', {
            encoding: "utf-8",
            flag: "r"
        }).then(
            data => {

                var folder_data = JSON.parse(data);

                let split_path = path.split('/')
                var folder = split_path.pop();
                if (folder == '') folder = split_path.pop();

                let which_folder = -1;
                for (let i in folder_data['file']) {
                    if (folder_data['file'][i]['name'] == folder) which_folder = i;
                }
                if (which_folder == -1) return Promise.reject([404, 'no such folder!']);

                return this.check_auth(auth, folder_data['file'][which_folder]['access']);
            }, reason => {
                return Promise.reject(reason);
            }
        ).then(
            data=> {
                return fs.mkdir(path+name);
            },reason=>{
                return Promise.reject(reason);
            }
        ).then(
            data=>{
                var folder_data={
                    file_num:0,
                    file:[]
                };
                return fs.writeFile(path+name+'/Yuki_config.json',JSON.stringify(folder_data));
            }
        ).then(
            data => {

                return fs.readFile(path + 'Yuki_config.json', {
                    encoding: "utf-8",
                    flag: "r"
                }, reason => {
                    return Promise.reject(reason);
                }).then(data => {

                    var folder_data=JSON.parse(data);

                    let my_date = new Date();
                    let time_now = my_date.getTime();
                    let time_num = Number(time_now);

                    var access = {};
                    if (folder_auth.user && folder_auth.user.length > 0) {
                        access.user = folder_auth.user;
                    }
                    if (folder_auth.password && folder_auth.password != '') {
                        access.password = folder_auth.password;
                    }

                    folder_data.file.push({
                        'name': name,
                        'type': 'folder',
                        'last_modification_time': time_num,
                        'access': access
                    });

                    folder_data.file_num=folder_data.file.length;

                    return fs.writeFile(path + 'Yuki_config.json', JSON.stringify(folder_data), {
                        encoding: "utf-8",
                        flag: "w"
                    });

                }, reason => {
                    return Promise.reject(reason);

                });

            }
        );

    },

}

module.exports = read_file;