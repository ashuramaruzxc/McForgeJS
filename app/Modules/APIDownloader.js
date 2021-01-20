const $ = require('../Util/$')
module.exports = class extends require('./HttpDownloader') {

    constructor(url) {
        $([[url, "string", true]])

        // extends HttpDownloader
        super(url, "API")

    }

}