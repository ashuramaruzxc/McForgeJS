const $ = require('../Util/$')
const LibraryDownloader = require('./LibraryDownloader')

const nodePath = require("path")

module.exports = class extends require('./HttpDownloader') {

    constructor(url, meta) {
        $([
            [url, "string", true],
            [meta, "string"]
        ])

        // extends HttpDownloader
        super(url, `meta/${meta}`)

    }

    install() {

        // load template of libraries to var
        let librariesArray = JSON.parse(this.data).libraries

        if (JSON.parse(this.data).mavenFiles)
            for (let lib of JSON.parse(this.data).mavenFiles)
                librariesArray.push(lib)

        // download libraries by metaJson
        for (let libraryTemplate of librariesArray) {

            // get url of library by libraryTemplate
            let downloadLibraryURL = getUrlByLibraryTemplate(libraryTemplate)

            // create new LibraryDownloader for downloading library
            let libraryDownloader = new LibraryDownloader(downloadLibraryURL)


            if (!libraryDownloader.isFileDownloaded()) {
                // notify to console about download library
                console.log(`Download ${nodePath.basename(downloadLibraryURL)}  size: ${getSizeFileByLibraryTemplate(libraryTemplate)}`)

                // download library by libraryDownloader
                libraryDownloader.download()
            }

            // function for getting url from library template
            function getUrlByLibraryTemplate(libraryTemplate) {
                return libraryTemplate.downloads.artifact.url
            }

            // function for getting file`s size from library template
            function getSizeFileByLibraryTemplate(libraryTemplate) {
                return libraryTemplate.downloads.artifact.size
            }

        }

    }

    // return array of name of jarLibraries
    getLibraries() {

        // get libraries from metaJson
        var jsondata = JSON.parse(this.data)
        var libraries = jsondata.libraries
        if (jsondata.mavenFiles)
            libraries = libraries.concat(JSON.parse(this.data).mavenFiles)


        // create array-returned
        const result = []

        for (let lib of libraries)
            // push to result path to JARlibrary
            result.push(nodePath.join("libraries", nodePath.basename(getUrlByLibraryTemplate(lib))))

        return result

        // function for getting url from library template
        function getUrlByLibraryTemplate(libraryTemplate) {
            return libraryTemplate.downloads.artifact.url
        }
    }


}
