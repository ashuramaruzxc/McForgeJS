const $ = require('../Util/$')

module.exports = class extends require('./FunctionDownloader') {

    constructor(url) {
        $([[url, "string", true]])

        // extends FunctionDownloader
        super(url, "Include")

    }

}