const $ = require('../Util/$')
const mkdir = require('../Util/mkdir')

const nodeRequest = require("sync-request")
const nodeFs = require("fs")
const nodePath = require("path")
module.exports =  class {

    constructor(url, path) {
        $([
            [url, "string", true],
            [path, "string"]
        ])

        // send values
        this.url = url
        this.path = path ? path : null

    }

    download(path) {
        $([
            [this.path ? this.path : path, "string", true]
        ])

        // initilize path
        if (this.path)
            path = this.path


        // create important vars
        let url = this.url
        let fullPath = this.getFilePath()

        // if file is downloaded just notify it by return
        if (this.isFileDownloaded(path)) {
            this.data = nodeFs.readFileSync(fullPath)
            return true
        }

        // download file
        let data = nodeRequest('GET', url).getBody()

        // save data to object of class
        this.data = data

        // check availability of dir
        if (!nodeFs.existsSync(path))
            mkdir(path + '/')

        // save requests files
        nodeFs.writeFileSync(fullPath, data)

    }

    getFileName() {
        return nodePath.basename(this.url)
    }

    getFilePath() {
        return nodePath.join(this.path, this.getFileName())
    }

    isFileDownloaded(path) {
        $([[this.path ? this.path : path, "string", true]])

        //initialize path
        path = path ? path : this.path

        // find file
        return nodeFs.existsSync(this.getFilePath())
    }

}
