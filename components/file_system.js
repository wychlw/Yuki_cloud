"use strict";
exports.__esModule = true;
exports.File_System = void 0;
var fs = require("fs");
var File_System = /** @class */ (function () {
    function File_System(config, path) {
        this.salt = config.salt;
        this.path = path;
    }
    File_System.prototype.get_structure = function (path) {
        var ret = JSON.parse(fs.readFileSync(path + "/Yuki_config.json", 'utf-8'));
        ret.type = "folder";
        return ret;
    };
    File_System.prototype.get_data = function (path) {
        var path_split = path.split('/');
        var path_now = this.path + '\\';
        for (var i in path_split) {
            var folder_data = this.get_structure(path_now);
            var is_exist = false;
            for (var j in folder_data.file) {
                if ((folder_data.file[j]).name == path_split[i]) {
                    is_exist = true;
                    break;
                }
            }
            if (!is_exist) {
                return [404, "File not found!"];
            }
            else if (!(path_split[Number(i) + 1] == undefined || path_split[Number(i) + 1] == '') && (folder_data.file[j]).type == "folder") {
                path_now += '/' + path_split[i];
                continue;
            }
            else if (!(path_split[Number(i) + 1] == undefined || path_split[Number(i) + 1] == '') && (folder_data.file[j]).type != "folder") {
                return [404, "File not found!"];
            }
            else if ((folder_data.file[j]).type != "folder") {
                return [200, folder_data.file[j]];
            }
            else {
                return [200, this.get_structure(path_now + '/' + path_split[i])];
            }
        }
    };
    File_System.prototype.download_file = function (path) {
        var file_statement = this.get_data(path);
        if (file_statement[0] != 200) {
            return file_statement;
        }
        else if ((file_statement[1]).type == "folder") {
            return [406, "It is a folder!"];
        }
        else {
            var full_path = this.path + '\\' + path;
            return [200, full_path];
        }
    };
    File_System.prototype.upload_file = function (path, query, file) {
        var folder_statement = this.get_data(path);
        if (folder_statement[0] != 200) {
            return folder_statement;
        }
        else if ((folder_statement[1]).type == "file") {
            return [406, "The path is a file!"];
        }
        else {
            var abs_path = this.path + '\\' + path + '\\';
            if (query.type == "folder") {
                fs.mkdirSync(abs_path + query.name);
                var new_folder_data = {
                    file_num: 0,
                    file: []
                };
                fs.writeFileSync(abs_path + query.name + "/Yuki_config.json", JSON.stringify(new_folder_data));
            }
            else if (query.type == "file") {
                file.pipe(fs.createWriteStream(abs_path + query.name));
            }
            var new_file_data = folder_statement[1];
            new_file_data.file_num++;
            new_file_data.file.push({
                name: query.name,
                type: query.type
            });
            new_file_data.type = undefined;
            fs.writeFileSync(abs_path + "Yuki_config.json", JSON.stringify(new_file_data));
            return [200, "Success!"];
        }
    };
    return File_System;
}());
exports.File_System = File_System;
