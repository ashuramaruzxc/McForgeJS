const $ = require('../Util/$')
module.exports = class extends require('./MetaJson') {
    constructor(url) {
        $([[url, "string", true]])

        // extends MetaJson
        super( url, "minecraft" )

    }

}