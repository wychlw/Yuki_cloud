import * as express from "express"
import * as fs from "fs"
import { File_System } from "./components/File_System"
import * as busboy from "busboy"

var app = express();

var config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
var abs_path = __dirname;

var file_system = new File_System(config,abs_path);

/**
 * api:
 * 
 * /#/* is for build single_page application
 * /f/* is for get file data
 * /d/* is for download file (if it is a folder, then return 406)
 * /u/* is for upload file
 * 
 * /s/* is for share file 
 * /api/* is discribed below
 *
 */

/**
 * /api/*:
 * some function may not so important or just very small, so is unfit to make a new top list specfic for it.
 * so, they will be put to here
 * 
 * /api/login login
 */

app.get('/f/*', (req, res) => {
    let path = "contents/" + (req.path.substr(3));
    console.log("query file with path:" + path);
    console.log("and " + JSON.stringify(req.query));
    let file_data = file_system.get_data(path);
    console.log("return with:\n",file_data);
    res.status(file_data[0]).send(file_data[1]);
});

app.get('/d/*', (req, res) => {
    let path = "contents/" + (req.path.substr(3));
    console.log("download file with path:" + path);
    console.log("and " + JSON.stringify(req.query));
    var download_data = file_system.download_file(path);
    console.log("return with:\n",download_data);
    if (download_data[0]!=200) {
        res.status(download_data[0]).send(download_data[1]);
    }
    else {
        res.status(download_data[0]).download(download_data[1]);
    }
});

app.post('/u/*', (req, res) => {
    let path = "contents/" + (req.path.substr(3));
    console.log("upload "+req.query.type+" with path:" + path);
    console.log("and " + JSON.stringify(req.query));
    var upload_return_data:[number,any]=[100,"Null"];
    if (req.query.type=="folder") {
        upload_return_data=file_system.upload_file(path,req.query,null);
        res.status(upload_return_data[0]).send(upload_return_data[1]);
    }
    else {
        var bsb=new busboy({headers:req.headers});
        bsb.on('file', function (fieldname, file, filename, encoding, mimetype) {
            req.query.name=filename;
            upload_return_data=file_system.upload_file(path,req.query,file);
        });
        bsb.on('finish', function () {
            res.writeHead(200, { 'Connection': 'close' });
            res.end('Success');
        });
        bsb.on('error', () => {
            res.writeHead(500, { 'Connection': 'close' });
            res.end('Fail');
        });
        return req.pipe(bsb);
    }
    console.log("return with:\n",upload_return_data);
});

app.get('/', (req, res) => {
    console.log(req.path);
    fs.promises.readFile('./index.html', 'utf-8').then(
        data => {
            res.status(200).type('html').send(data);
        }
    ).catch(
        reason => {
            res.status(500).send([500, "Internal server error!"]);
            console.warn(reason);
        }
    );
});


app.listen(config.port, config.url, () => {
    console.log('server listen on: ' + config.url + ':' + config.port);
}
);