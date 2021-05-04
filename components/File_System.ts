import * as crypto from "crypto"
import * as fs from "fs"


class File_System{
    
    salt:string
    path:string

    constructor(config:{"port":number,"url":string,"salt":string},path:string){
        this.salt=config.salt;
        this.path=path;
    }

    private get_structure(path:string):{"file_num":number,type:string,"file":[{"name":string,"type":string}]} {
        var ret = JSON.parse(fs.readFileSync(path+"/Yuki_config.json",'utf-8'));
        ret.type="folder";
        return ret;
    }

    get_data(path:string):[number,any] {
        var path_split=path.split('/');
        var path_now=this.path+'\\';
        for (var i in path_split) {
            let folder_data=this.get_structure(path_now);
            var is_exist=false;
            for (var j in folder_data.file) {
                if ((folder_data.file[j]).name==path_split[i]) {
                    is_exist=true;
                    break;
                }
            }
            if (!is_exist) {
                return [404,"File not found!"];
            }
            else if ( !(path_split[Number(i)+1]==undefined || path_split[Number(i)+1]=='') && (folder_data.file[j]).type=="folder") {
                path_now+='/'+path_split[i];
                continue;
            }
            else if ( !(path_split[Number(i)+1]==undefined || path_split[Number(i)+1]=='') && (folder_data.file[j]).type!="folder") {
                return [404,"File not found!"];
            }
            else if ((folder_data.file[j]).type!="folder") {
                return [200,folder_data.file[j]];
            }
            else {
                return [200,this.get_structure(path_now+'/'+path_split[i])];
            }
            
        }
    }

    download_file(path:string):[number,any]{
        var file_statement=this.get_data(path);
        if (file_statement[0]!=200) {
            return file_statement;
        }
        else if ((file_statement[1]).type=="folder"){
            return [406,"It is a folder!"];
        }
        else {
            var full_path=this.path+'\\'+path;
            return [200,full_path];
        }
    }

    upload_file(path:string,query:any,file:any):[number,any]{
        var folder_statement=this.get_data(path);
        if (folder_statement[0]!=200) {
            return folder_statement;
        }
        else if ((folder_statement[1]).type=="file"){
            return [406,"The path is a file!"]
        }
        else {
            var abs_path=this.path+'\\'+path+'\\';
            if (query.type=="folder") {
                fs.mkdirSync(abs_path+query.name);
                var new_folder_data={
                    file_num:0,
                    file:[]
                };
                fs.writeFileSync(abs_path+query.name+"/Yuki_config.json",JSON.stringify(new_folder_data));
            }
            else if (query.type=="file") {
                file.pipe(fs.createWriteStream(abs_path+query.name));
            }
            var new_file_data=folder_statement[1];
            new_file_data.file_num++;
            new_file_data.file.push({
                name:query.name,
                type:query.type
            });
            new_file_data.type=undefined;
            fs.writeFileSync(abs_path+"Yuki_config.json",JSON.stringify(new_file_data));
            return [200,"Success!"]
        }
    }
}

export {File_System};