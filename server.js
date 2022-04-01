const express = require('express');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const moment = require('moment');
const busboy = require('busboy');

var app = express();
// deploy server dir
const distDir = '/home/strong/Desktop/auto-deploy/test/'
// backup file name
const backDirName = `portal${moment().format('YYYY-MM-DD-HH-mm-ss')}`

app.get('/', (req, res) => {
    res.send(
      `<!DOCTYPE html>
        <html>
        <body>
          <form action="upload" method="post" enctype="multipart/form-data">
            <h1>选择上传的文件</h1>  
            <input type="file" name="file">
            <input type="submit" value="上传">
          </form>
        </body>
        </html>`
    )
})

app.post('/upload', (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
    const bb = busboy({ headers: req.headers });
    bb.on('file', (name, file, info) => {
	    // console.log(name, file, info)
        if (!info || !['application/zip', 'application/octet-stream'].includes(info.mimeType)) {
            res.end('别瞎搞啊,选择一个zip文件');
            return
        }
        // upload
        const saveTo = path.join(distDir, 'portal.zip');
        file.pipe(fs.createWriteStream(saveTo));
        if (fs.existsSync(`${distDir}portal`)) {
            // backup
            shell.exec(`mv portal ${backDirName}`, {cwd: distDir}, () => {
                // unzip
                shell.exec(`unzip portal.zip`, {cwd: distDir}, (e, a) => {
                    // copy admin and mobile
                    shell.exec(`cp -R admin/ mobile/ ../portal`, {cwd: `${distDir}${backDirName}`}) 
                })
            })
        }
    });
    bb.on('close', () => {  
        res.end(`铁子、成功了！`);
    });
    req.pipe(bb);
    return;
})

app.listen(3090, function () {
    console.log('服务启动成功: http://localhost:3090');
});
