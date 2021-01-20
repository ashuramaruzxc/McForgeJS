const $ = require('../Util/$')
module.exports = class extends require('./HttpDownloader') {

    constructor(url, path) {
        $([
            [url,  "string", true],
            [path, "string",     ]
        ])

        // extends HttpDownloader
        super(url, `functions${path}`)

    }

}