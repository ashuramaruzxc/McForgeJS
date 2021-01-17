const $ = require('../Util/$')
const MinecraftMetaJson = require('./MinecratMetaJson')
const ForgeMetaJson = require('./ForgeMetaJson')
const APIDownloader = require('./APIDownloader')
const Translator = require('./Translator')

module.exports = class {

    constructor( args ) {
        $([
            [args.displayName       , "string"                         , true],
            [args.minecraftMetaJson , MinecraftMetaJson , true],
            [args.forgeMetaJson     , ForgeMetaJson     , true],
            [args.minecraftAPI      , APIDownloader     , true],
            [args.translator        , Translator        , true],
            [args.includeFunc       , "function"                             ],
            [args.exportFunc        , "function"                             ]
        ])

        // send arguments to object of class
        this.displayName       = args.displayName
        this.minecraftMetaJson = args.minecraftMetaJson
        this.forgeMetaJson     = args.forgeMetaJson
        this.minecraftAPI      = args.minecraftAPI
        this.translator        = args.translator
        this.includeFunc       = args.includeFunc
        this.exportFunc        = args.exportFunc

    }

}
