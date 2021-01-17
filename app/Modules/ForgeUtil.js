const $ = require('../Util/$')
module.exports = class {
    constructor( args ) {
        $([
            [args.name, "string", true],
            [args.includeFunc, "function"],
            [args.exportFunc, "function"],
            [args.innerElements, "object"],
            [args.outerElements, "object"]
        ])

        // load propertyes
        this.name = args.name
        this.includeFunc = args.includeFunc
        this.exportFunc = args.exportFunc
        this.innerElements = args.innerElements
        this.outerElements = args.outerElements
    }
}
