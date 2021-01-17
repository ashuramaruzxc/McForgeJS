const nodeFs = require('fs')
module.exports = function mkdir(path, pathPre = "") {
    if (path.indexOf("/") === -1) return
    if (nodeFs.existsSync(pathPre + path.slice(0,path.indexOf("/"))))
        mkdir(path.slice(path.indexOf("/")+1), pathPre + path.slice(0,path.indexOf("/")+1))
    else {
        nodeFs.mkdirSync(pathPre + path.slice(0,path.indexOf("/")))
        mkdir(path.slice(path.indexOf("/")+1), pathPre + path.slice(0,path.indexOf("/")+1))
    }
}