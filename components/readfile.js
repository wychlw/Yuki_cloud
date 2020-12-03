const crypto = require('crypto');
const fs = require('fs').promises;

const read_file = {

    'folder_data': null,
    'which_file': null,

    check_auth(user_auth, file_auth) {
        return new Promise(function (resolve, reject) {

            var ret = [403, { 'wrong_password': false, 'invalid_user': false }, ""];

            if (file_auth.password) {
                if (user_auth.password) {
                    let hash = crypto.createHash('sha256');
                    let input_pass_hash = hash.update(user_auth.password).digest().toString('base64');
                    if (input_pass_hash == file_auth.password) resolve([200, 'success!']);
                }

                ret[1].wrong_password = true;
                ret[2] += " Wrong password!";
            }

            if (file_auth.user) {
                if (user_auth.user) {
                    for (var j of file_auth.user) {
                        if (user_auth.user == j) resolve([200, 'success!']);

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
                var file_data = this.folder_data['file'][this.which_file];
                delete file_data.access;
                if (data != null) {
                    var file_data_add = JSON.parse(data);
                    for (let i in file_data_add) file_data[i] = file_data_add[i];
                    for (let i of file_data['file']) delete i.access;
                }
                return Promise.resolve(file_data);
            }, reason => {
                return Promise.reject(reason);
            }
        )
    }

}

module.exports = read_file;