const $ = require('../Util/$')
const IncludeFunctionDownloader = require('./IncludeFunctionDownloader')
const ExportFunctionDownloader = require('./ExportFunctionDownloader')
const GameVersion = require('./GameVersion')
const MinecraftMetaJson = require('./MinecratMetaJson')
const ForgeMetaJson = require('./ForgeMetaJson')
const APIDownloader = require('./APIDownloader')
const Translator = require('./Translator')

const nodeRequest = require("sync-request")
const neatCsv = require("neat-csv")
const nodeFs = require("fs")
const nodePath = require("path")

module.exports = function ( displayName, propertyes ) {


    $([
        [displayName, "string", true],
        [propertyes  , "object"]
    ])

    // turn propertyes to object if it is not defined
    propertyes = propertyes ? propertyes : {}

    // create and return GameVersion
    // link of important files
    var filesLink = "https://minecraft-jsons.modepaes.repl.co/"

        // install include and export functions
    ;(new IncludeFunctionDownloader(filesLink + "gameVersionIncludeFunction/" + displayName + ".js")).download()
    ;(new ExportFunctionDownloader(filesLink + "gameVersionExportFunction/" + displayName + ".js")).download()

    // choose method installing of translator
    // stable mode
    if ( !propertyes.unstable )
        return new GameVersion({
            translator: new Translator(filesLink + "translator/" + displayName + ".json"),
            minecraftMetaJson: new MinecraftMetaJson(filesLink + "minecraftMetaJson/" + displayName + ".json"),
            forgeMetaJson: new ForgeMetaJson(filesLink + "forgeMetaJson/" + displayName + ".json"),
            minecraftAPI: new APIDownloader(filesLink + "API/" + displayName + ".jar"),
            //TODO
            //includeFunc: require("./functionsInclude/" + displayName),
            //exportFunc: require("./functionsExport/" + displayName),
            displayName
        })

    // unstable mode
    const latestTranslator = {}

        // load unstable translator to const latestTranslator
    ;(async () => {
        // download parts of translator
        let fields  =  await neatCsv(nodeRequest("GET", "http://export.mcpbot.bspk.rs/fields.csv").getBody())
        let methods =  await neatCsv(nodeRequest("GET", "http://export.mcpbot.bspk.rs/methods.csv").getBody())
        let params  =  await neatCsv(nodeRequest("GET", "http://export.mcpbot.bspk.rs/params.csv").getBody())
        let rows    = fields.concat(methods, params)
        for ( let row of rows )
            latestTranslator[row.name] = row.searge
    })()

    // load to translator/latest.json
    nodeFs.writeFileSync(nodePath.join("translators", "latest.json"), JSON.stringify(latestTranslator))

    // return gameVersion with latest translator
    return new GameVersion({
        translator: new Translator("https://nolink/latest.json"),
        minecraftMetaJson: new MinecraftMetaJson(filesLink + "minecraftMetaJson/" + displayName + ".json"),
        forgeMetaJson: new ForgeMetaJson(filesLink + "forgeMetaJson/" + displayName + ".json"),
        minecraftAPI: new APIDownloader(filesLink + "API/" + displayName + ".jar"),
        //TODO
        //includeFunc: require(nodePath.join("functionsInclude", displayName + ".js")),
        //exportFunc: require(nodePath.join("functionsExport", displayName + ".js")),
        displayName
    })


}