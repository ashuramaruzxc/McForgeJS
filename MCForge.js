 "use strict"
 
 const nodeRequest     = require("sync-request")
 const nodePath        = require("path")
 const nodeFs          = require("fs")
 const nodeDel         = require("del")
 const { execSync }    = require("child_process")
 const neatCsv         = require("neat-csv")
 
// create info for diferent os
var JAVAC_COMMAND  = "javac"
var JAR_COMMAND    = "jar"
if ( require('os').platform() === "win32" )  {
    var FINDER_COMMAND = 'dir /s /B *.java > sources.txt'
    var PREFIX_COMMAND = ';'
    var OS_DETECTOR    = "win32"
}
else {
    var FINDER_COMMAND = 'find . -type f -name "*.java" > sources.txt'
    var PREFIX_COMMAND = ':'
    var OS_DETECTOR    = "other"
}


const This = { classList: { } }
This.classList.ForgeUtil = class {
            
    constructor( args ) {
        $([
            [args.name          , "string"   , true],
            [args.includeFunc   , "function"       ],
            [args.exportFunc    , "function"       ],
            [args.innerElements , "object"         ],
            [args.outerElements , "object"         ]
        ])
        
        // Errors
        if ( args.hasOwnProperty("includeFunc") && typeof args.includeFunc !== "function")
            throw new Error("Type of includeFunction is not function")
            
        if ( args.hasOwnProperty("exportFunc") && typeof args.exportFunc !== "function")
            throw new Error("Type of exportFunction is not function")
            
        if ( args.hasOwnProperty("innerElements") && typeof args.innerElements !== "object")
            throw new Error("Type of innerElements is not object")
        
        if ( args.hasOwnProperty("outerElements") && typeof args.outerElements !== "object")
            throw new Error("Type of outerElements is not object")
            
        if ( !args.hasOwnProperty("name") || typeof args.name !== "string")
            throw new Error("Type of name is not string")
            
        // load propertyes
        this.name          = args.name
        this.includeFunc   = args.includeFunc
        this.exportFunc    = args.exportFunc
        this.innerElements = args.innerElements
        this.outerElements = args.outerElements
    }
            
}

This.classList.HttpDownloader = class {
            
    constructor( url, path ) {
        $([
            [url , "string", true],
            [path, "string"]
        ])
            
        // send values
        this.url  = url
        this.path = path?path:null
        
    }
    
    download(path) {
        $([
            [this.path?this.path:path, "string", true]
        ])
            
        // initilize path
        if ( this.path )
            path = this.path
            
        
        // create important vars
        let url      = this.url
        let fullPath = this.getFilePath()
        
        // if file is downloaded just notify it by return
        if ( this.isFileDownloaded(path) ) {
            this.data = nodeFs.readFileSync(fullPath)
            return true
        }
            
        // download file
        let data     = nodeRequest('GET', url).getBody()
        
        // save data to object of class
        this.data = data
        
        // check availability of dir
        if (!nodeFs.existsSync(path))
            mkdir(path+'/')
            
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
        $([ [this.path?this.path:path, "string", true] ])
        
        //initileze path
        path = path?path:this.path
        
        // find file
        return nodeFs.existsSync(this.getFilePath())
    }
            
}

This.classList.MetaJson = class extends This.classList.HttpDownloader {
                        
    constructor(url, meta) {
        $([
            [url  , "string", true],
            [meta , "string"]
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
        for ( let libraryTemplate of librariesArray )
        {
            
            // get url of library by libraryTemplate
            let downloadLibraryURL = getUrlByLibraryTemplate(libraryTemplate)
            
            // create new LibraryDownloader for downloading library
            let libraryDownloader = new This.classList.LibraryDownloader(downloadLibraryURL)
            
            
            if ( !libraryDownloader.isFileDownloaded() )
            {
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
        var jsondata  = JSON.parse(this.data)
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
This.classList.ForgeMetaJson = class extends This.classList.MetaJson {
    
    constructor(url) {
        $([[url, "string", true]])
        
        // extends MetaJson
        super( url, "forge" )
        
    }
    
}
This.classList.MinecraftMetaJson = class extends This.classList.MetaJson {
    
    constructor(url) {
        $([[url, "string", true]])
        
        // extends MetaJson
        super( url, "minecraft" )
        
    }
    
}

This.classList.Translator = class extends This.classList.HttpDownloader {
            
    constructor(url) {
        $([[url, "string", true]])
        
        // extends HttpDownloader
        super(url, "translators")
        
    }
            
}
This.classList.APIDownloader = class extends This.classList.HttpDownloader {
                        
    constructor(url) {
        $([[url, "string", true]])
        
        // extends HttpDownloader
        super(url, "API")
        
    }
            
}
This.classList.LibraryDownloader = class extends This.classList.HttpDownloader {
                        
    constructor(url) {
        $([[url, "string", true]])
        
        // extends HttpDownloader
        super(url, "libraries")
        
    }
    
}

This.classList.FunctionDownloader = class extends This.classList.HttpDownloader {
 
    constructor(url, path) {
    $([
        [url,  "string", true],
        [path, "string",     ]
    ])
    
    // extends HttpDownloader
    super(url, `functions${path}`)
        
    }
    
}
This.classList.IncludeFunctionDownloader = class extends This.classList.FunctionDownloader {
    
    constructor(url) {
    $([[url, "string", true]])
    
    // extends FunctionDownloader
    super(url, "Include")
        
    }
    
}
This.classList.ExportFunctionDownloader = class extends This.classList.FunctionDownloader {
    
    constructor(url) {
    $([[url, "string", true]])
    
    // extends FunctionDownloader
    super(url, "Export")
        
    }
    
}

This.classList.GameVersion = class {
            
    constructor( args ) {
        $([
            [args.displayName       , "string"                         , true],
            [args.minecraftMetaJson , This.classList.MinecraftMetaJson , true],
            [args.forgeMetaJson     , This.classList.ForgeMetaJson     , true],
            [args.minecraftAPI      , This.classList.APIDownloader     , true],
            [args.translator        , This.classList.Translator        , true],
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
This.getGameVersion = function ( displayName, propertyes ) {
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
    ;(new This.classList.IncludeFunctionDownloader(filesLink + "gameVersionIncludeFunction/" + displayName + ".js")).download()
    ;(new This.classList.ExportFunctionDownloader(filesLink + "gameVersionExportFunction/" + displayName + ".js")).download()
    
    // choose method installing of translator
    // stable mode
    if ( !propertyes.unstable )
        return new This.classList.GameVersion({
            translator: new This.classList.Translator(filesLink + "translator/" + displayName + ".json"),
            minecraftMetaJson: new This.classList.MinecraftMetaJson(filesLink + "minecraftMetaJson/" + displayName + ".json"),
            forgeMetaJson: new This.classList.ForgeMetaJson(filesLink + "forgeMetaJson/" + displayName + ".json"),
            minecraftAPI: new This.classList.APIDownloader(filesLink + "API/" + displayName + ".jar"),
            includeFunc: require("./functionsInclude/" + displayName),
            exportFunc: require("./functionsExport/" + displayName),
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
    return new This.classList.GameVersion({
            translator: new This.classList.Translator("https://nolink/latest.json"),
            minecraftMetaJson: new This.classList.MinecraftMetaJson(filesLink + "minecraftMetaJson/" + displayName + ".json"),
            forgeMetaJson: new This.classList.ForgeMetaJson(filesLink + "forgeMetaJson/" + displayName + ".json"),
            minecraftAPI: new This.classList.APIDownloader(filesLink + "API/" + displayName + ".jar"),
            includeFunc: require(nodePath.join("functionsInclude", displayName + ".js")),
            exportFunc: require(nodePath.join("functionsExport", displayName + ".js")),
            displayName
        })
    
    
}

This.Mod = class {
        
    constructor( args ) {
        $([
            [args.modid                                                                                         , "string"                     ,true],
            [args.gameVersion                                                                                   , This.classList.GameVersion   ,true],
            [args.author                                                                                        , "string"                     ,true],
            [args.version?args.version:args.version="1.0"                                                       , "string"                          ],
            [args.host?args.host:args.host="me"                                                                 , "string"                          ],
            [args.description?args.description:args.description="Minecraft modification created by MCForge.js"  , "string"                          ],
            [args.url?args.url:args.url=""                                                                      , "string"                          ],
            [args.name?args.name:args.name=args.modid                                                           , "string"                          ],
            [args.credits?args.credits:args.credits=""                                                          , "string"                          ]
        ])
        
        // create object with information about mod
        this.info = {}
        
        // load info to the Mod
        this.info.modid       = args.modid
        this.info.author      = args.author
        this.info.version     = args.version
        this.info.host        = args.host
        this.info.description = args.description
        this.info.url         = args.url
        this.info.name        = args.name
        this.info.credits     = args.credits

        this.jar              = args.jar
        this.javac            = args.javac
        
            
        // important vars
        var modid = this.info.modid
        
        // create template JAVA packages
        this.JAVAPACKAGESYSTEM = { "MCFORGE_SYSTEM_TAG_ROOT_OBJECT_DETECTOR" : true }
        this.JAVAPACKAGESYSTEM[this.info.modid] = {
            "MCFORGE_SYSTEM_TAG_INCLUDE_LIST" : [],
            "MCFORGE_SYSTEM_TAG_APPEND_LIST" : [],
            "MCFORGE_SYSTEM_TAG_MODID_DETECTOR" : true
        }
        
        // create objects and arrays for other parts
        this.FUNCTIONEXPORTLIST = []
        this.util = {}
        this.FILESAPENDEDTOARCHIVE = []
        
        // load gameVersion
        this.gameVersion = args.gameVersion
        this.gameVersion.includeFunc.call(this)
        this.FUNCTIONEXPORTLIST.push(this.gameVersion.exportFunc)
        
        // create assets object
        this.ASSETS = {}
        this.ASSETS.LANGUAGEINFO = {}
        this.ASSETS.lang = new Proxy(this.ASSETS.LANGUAGEINFO, {
            get( target, lang ) {
                
                // Error
                if ( lang.length !== 5 || lang[2] !== '_' )
                    throw new Error(`${lang} lang is not suported`)
                    
                // try create lang object 
                if ( !target[lang] ) target[lang] = {}
                    
                return {
                    put(type, name, value) {
                        
                        // Errors
                        if ( !type || typeof type !== "string" )
                            throw new Error("Type of type is not string")
                        if ( !name || typeof name !== "string" )
                            throw new Error("Type of name is not string")
                        if ( !value || typeof value !== "string" )
                            throw new Error("Type of value is not string")
                            
                        // send info to target
                        target[lang][`${type}.${modid}.${name}`] = value
                        
                    }
                }
                    
            },
            set() { throw new Error("Lang must be changed by lang['en_us'].put(type, name, value)") }
        })
        
        this.ASSETS.MODELSINFO = {}
        this.ASSETS.models = createProxyAutoObject( this.ASSETS.MODELSINFO )
        
        this.ASSETS.TEXTURESINFO = {}
        this.ASSETS.textures = createProxyAutoObject( this.ASSETS.TEXTURESINFO )
        
        // create template of data
        this.DATAINFO = {}
        this.DATA = createProxyAutoObject( this.DATAINFO )
        
    }
    
    get JAVA() {
        var modid = this.info.modid
        return (function getJAVAProxyObject (JPs) {
            return new Proxy(JPs, {
                get(JP , prop ) {
                    switch ( prop ) {
                        // function Java
                        case "include": return function include( includePath ) {
                            if (JP.MCFORGE_SYSTEM_TAG_ROOT_OBJECT_DETECTOR !== true) {
                                if (JP.MCFORGE_SYSTEM_TAG_INCLUDE_LIST === undefined) JP.MCFORGE_SYSTEM_TAG_INCLUDE_LIST = []
                                if (JP.MCFORGE_SYSTEM_TAG_INCLUDE_LIST.includes(includePath)) return
                                var splitedIncludePath = includePath.split(".")
                                splitedIncludePath.pop()
                                var isHasImportParentPackage;
                                for (let p of splitedIncludePath)
                                    for (let includer of JP.MCFORGE_SYSTEM_TAG_INCLUDE_LIST)
                                        if (includer.indexOf(includePath.slice(0, includePath.indexOf(p) + p.length) + ".*") === 0)
                                        {
                                            isHasImportParentPackage = true
                                            break
                                        }
                                if (!isHasImportParentPackage) JP.MCFORGE_SYSTEM_TAG_INCLUDE_LIST.push(`${includePath}`)
                            }
                            else {
                                if (JP[modid] === undefined) JP[modid] = []
                                if (JP[modid].MCFORGE_SYSTEM_TAG_INCLUDE_LIST === undefined) JP[modid].MCFORGE_SYSTEM_TAG_INCLUDE_LIST = []
                                if (JP[modid].MCFORGE_SYSTEM_TAG_INCLUDE_LIST.includes(includePath)) return
                                var splitedIncludePath = includePath.split(".")
                                splitedIncludePath.pop()
                                var isHasImportParentPackage;
                                for (let p of splitedIncludePath)
                                    for (let includer of JP[modid].MCFORGE_SYSTEM_TAG_INCLUDE_LIST)
                                        if (includer.indexOf(includePath.slice(0, includePath.indexOf(p) + p.length) + ".*") === 0)
                                        {
                                            isHasImportParentPackage = true
                                            break
                                        }
                                if (!isHasImportParentPackage) JP[modid].MCFORGE_SYSTEM_TAG_INCLUDE_LIST.push(includePath)
                            }
                        }
                        case "append": return  function append( appendValue ) {
                            if (JP.MCFORGE_SYSTEM_TAG_ROOT_OBJECT_DETECTOR !== true) {
                                if (JP.MCFORGE_SYSTEM_TAG_APPEND_LIST === undefined) JP.MCFORGE_SYSTEM_TAG_APPEND_LIST = []
                                JP.MCFORGE_SYSTEM_TAG_APPEND_LIST.push(appendValue)
                            }
                            else {
                                if (JP[modid] === undefined) JP[modid] = []
                                if (JP[modid].MCFORGE_SYSTEM_TAG_APPEND_LIST === undefined) JP[modid].MCFORGE_SYSTEM_TAG_APPEND_LIST = []
                                JP[modid].MCFORGE_SYSTEM_TAG_APPEND_LIST.push(appendValue)
                            }
                        }
                        // open new packages
                        default:
                            if (JP[prop] === undefined) JP[prop] = {}
                            return getJAVAProxyObject(JP[prop])
                        // Error propertyes
                        case "MCFORGE_SYSTEM_TAG_APPEND_LIST":
                        case "MCFORGE_SYSTEM_TAG_INCLUDE_LIST":
                        case "MCFORGE_SYSTEM_TAG_ROOT_OBJECT_DETECTOR":
                            throw new Error("This name is used by MCForge, please change name of packages.")
                    }
                    
                },
                set( ) {
                    throw new Error("You cannot change value of packages by traditional method")
                }
            })
        })(this.JAVAPACKAGESYSTEM)
    }
    
    exportJAR(path, args) {
        $([
            [path, "string"],
            [args, "object"]
        ])
        
        // download important libraries
            
            // download metaJsons
            this.gameVersion.minecraftMetaJson.download()
            this.gameVersion.forgeMetaJson.download()
            
            // download minecraftAPI
            this.gameVersion.minecraftAPI.download()
            
            // download translator
            this.gameVersion.translator.download()
            
            // install libraries by metaJsons
            this.gameVersion.minecraftMetaJson.install()
            this.gameVersion.forgeMetaJson.install()
            
            // setting custom javac and jar
            if ( this.jar   ) JAR_COMMAND   = `"${this.jar}"`
            if ( this.javac ) JAVAC_COMMAND = `"${this.javac}"`
                
        // create modification`s folder template
            // new dir for modification
            mkdir("output/")
            
            
            // load Java packages
            const host    = this.info.host
            const modid   = this.info.modid
            const author  = this.info.author
            const version = this.info.version
            const JAVAPACKAGESYSTEM = this.JAVAPACKAGESYSTEM
            ;(function loadPackage(pack, path, pack_name) {
                if ( pack.MCFORGE_SYSTEM_TAG_APPEND_LIST || pack.MCFORGE_SYSTEM_TAG_INCLUDE_LIST)
                {
                    let JavaOutput = `package ${path.slice(0, path.lastIndexOf('.'))};\n\n`
                    if (pack.MCFORGE_SYSTEM_TAG_INCLUDE_LIST)
                        for (let includeString of pack.MCFORGE_SYSTEM_TAG_INCLUDE_LIST)
                            JavaOutput += `import ${includeString};\n`
                    if (pack.MCFORGE_SYSTEM_TAG_MODID_DETECTOR)
                        JavaOutput += `\n@Mod("${modid}")`
                    JavaOutput += `\npublic class ${pack_name} {\n`
                    if (pack.MCFORGE_SYSTEM_TAG_APPEND_LIST)
                        for (let appendString of pack.MCFORGE_SYSTEM_TAG_APPEND_LIST)
                            JavaOutput += `\t${appendString}\n\n`
                    JavaOutput += "}"
                    mkdir("output/"+path.replace(/\./g, "/"))
                    nodeFs.writeFileSync(nodePath.join("output",path.replace(/\./g, "/") +  ".java"), JavaOutput)
                }
                for (let package_index in pack)
                {
                    if (typeof pack[package_index] !== "object") continue
                    loadPackage(pack[package_index], `${path}.${package_index}`, package_index)
                }
                
                
            })( JAVAPACKAGESYSTEM, `${host}.${author}.${modid}` )
            
            // call ForgeUtil`s functions
            for ( let exportFunction of this.FUNCTIONEXPORTLIST )
                exportFunction.call(this)
            
            // load assets to jar
            const assetsPath = `output/assets/${modid}/`
            mkdir(assetsPath)
            
            const langPath = assetsPath + "lang/"
            mkdir(langPath)
            const langs = this.ASSETS.LANGUAGEINFO
            for ( let lang_i in langs )
                nodeFs.writeFileSync(nodePath.join(langPath, lang_i + ".json"), JSON.stringify(langs[lang_i]))
                
            const modelsPath = assetsPath + "models/"
            mkdir(modelsPath)
            const models = this.ASSETS.MODELSINFO
            for ( let type in models ) {
                mkdir(modelsPath + type + "/")
                for ( let model_name in models[type] )
                    nodeFs.writeFileSync(nodePath.join(modelsPath, type, model_name + ".json"), JSON.stringify(models[type][model_name]))
            }
                    
            const texturesPath = assetsPath + "textures/"
            mkdir(texturesPath)
            const textures = this.ASSETS.TEXTURESINFO
            for ( let type in textures ) {
                mkdir(texturesPath + type + "/")
                for ( let textureTemplate_i in textures[type] )
                    nodeFs.writeFileSync(nodePath.join(texturesPath, type, textures[type][textureTemplate_i].fileName), nodeFs.readFileSync(textures[type][textureTemplate_i].filePath))
            }
            
            // load data(dir) to jar
            const dataPath = `output/data/${modid}/`
            mkdir(dataPath)
            const datas = this.DATAINFO
            for ( let type in datas ) 
            {
                mkdir(dataPath + type + "/")
                for ( let typeObj in datas[type] )
                {
                    mkdir(dataPath + type + "/" + typeObj + "/")
                    for ( let d in datas[type][typeObj] )
                        nodeFs.writeFileSync(nodePath.join(dataPath, type, typeObj, d + ".json"), JSON.stringify(datas[type][typeObj][d]))
                }
            }
            
            // load files to jar 
            for ( let fileInfo of this.FILESAPENDEDTOARCHIVE ) {
                mkdir("output/" + fileInfo.pathArhiveFile)
                if (fileInfo.pathFile)
                    nodeFs.writeFileSync("output/" + fileInfo.pathArhiveFile, nodeFs.readFileSync(fileInfo.pathFile))
                else
                    nodeFs.writeFileSync("output/" + fileInfo.pathArhiveFile, fileInfo.value)
            }
                
            // load info files
//             const MODFILE_MCMETA = `{
// "pack": {
//     "description": "examplemod resources",
//     "pack_format": 5,
//     "_comment": "A pack_format of 5 requires json lang files and some texture changes from 1.15. Note: we require v5 pack meta for all mods."
// }
// }`
//             nodeFs.writeFileSync("output/pack.mcmeta", MODFILE_MCMETA)
//             
//             var MODFILE_TOML = `
// modLoader="javafml" 
// loaderVersion="[${JSON.parse(this.gameVersion.forgeMetaJson.data).version.slice(0, 2)},)" 
// issueTrackerURL="http://my.issue.tracker/" #optional
// [[mods]] 
// modId="${this.info.modid}" 
// version="${this.info.version}"
// displayName="${this.info.name}" 
// updateJSONURL="http://myurl.me/" 
// displayURL="http://example.com/" 
// logoFile="examplemod.png"
// credits="${this.info.credits}"
// authors="${this.info.author}" 
// description='''
// ${this.info.description}
// '''
// 
// [[dependencies.examplemod]] 
// modId="forge" 
// mandatory=true 
// versionRange="[${this.gameVersion.forgeMetaJson.getFileName().slice(0,2)},)" 
// ordering="NONE"
// side="BOTH"
// 
// [[dependencies.examplemod]]
// modId="minecraft"
// mandatory=true
// versionRange="[${this.gameVersion.displayName}]"
// ordering="NONE"
// side="BOTH"
// 
// `
//             mkdir("output/META-INF/")
//             nodeFs.writeFileSync("output/META-INF/mods.toml", MODFILE_TOML)
            
            // compile .java files -----
            
            // find .java files
            execSync(FINDER_COMMAND, { cwd: "output" })
            
            // create bash command for compile modification
            var compileCommand = `${JAVAC_COMMAND} -classpath `
            
            // add to command minecraft libraries
            var pathLibraries = this.gameVersion.minecraftMetaJson.getLibraries()
            for (let pathLib of pathLibraries)
                compileCommand += `../${pathLib}${PREFIX_COMMAND}`
                
            // add to command forge libraries
            var pathLibraries = this.gameVersion.forgeMetaJson.getLibraries()
            for (let pathLib of pathLibraries)
                compileCommand += `../${pathLib}${PREFIX_COMMAND}`
                
            // add API as library
            compileCommand += "../" + this.gameVersion.minecraftAPI.getFilePath()
            
            // add compiled files
            compileCommand += " @sources.txt"
            
            // send command to console
            execSync(compileCommand, { cwd: "output" } , err => console.log(err))
            
            // remove .java files by sources.txt
            var javaFiles = nodeFs.readFileSync("./output/sources.txt", "utf-8").split("\n")
            javaFiles.pop()
            
            
            for (let file of javaFiles)
            {
                if ( OS_DETECTOR === "win32" ) {
                    file = file.slice(0, file.length-1)
                    nodeFs.unlinkSync(file)
                }
                else nodeFs.unlinkSync(nodePath.join("output", file))
            }
                
            // remove helped files
            nodeFs.unlinkSync(nodePath.join("output", "sources.txt"))
            
            //execSync(`rmdir logs`, { cwd: "output" })
                
            // arhive mod`s files to jar
            execSync(`${JAR_COMMAND} cf ${path?path:"../output.jar"} ./`, { cwd:"./output" })
            
            // remove mod`s folder
            nodeDel("output")
            
            
    }
    
    includeUtil( forgeUtil ) {
        $([
            [forgeUtil, This.classList.ForgeUtil, true]
        ])
            
        // append export function
        if ( forgeUtil.exportFunc )
            this.FUNCTIONEXPORTLIST.push(forgeUtil.exportFunc)
            
        // important var
        var ModT = this
        
        // load inner Elements
        if ( forgeUtil.innerElements )
            for ( let El_i in forgeUtil.innerElements )
                if ( !this.hasOwnProperty(El_i) )
                    this[El_i] = forgeUtil.innerElements[El_i]
                else throw new Error(`ForgeUtil ${forgeUtil.name} cannot install ${El_i} to Mod because it is already initilize`)
                
        // load outer Elements
        this.util[ forgeUtil.name ] = {}
        if ( forgeUtil.outerElements )
            for ( let El_i in forgeUtil.outerElements )
                this.util[ forgeUtil.name ][ El_i ] = (function (i) { return function () { forgeUtil.outerElements[ i ].call(ModT) } })(El_i)
            
        // call include function
        if ( forgeUtil.includeFunc )
            forgeUtil.includeFunc.call(this)
    }
    
    appendToJar( arg, pathArhiveFile) {
        $([
            [arg            , ["string", "object"]  , true],
            [pathArhiveFile , "string"                    ]
        ])
            
        // initilize important vars
        var value    = typeof arg === "object"? arg.value :undefined
        var pathFile = typeof arg === "string"? arg       :undefined 
            
        // append path and value to appay            
        this.FILESAPENDEDTOARCHIVE.push({ pathArhiveFile, pathFile, value})
        
    }
        
}
module.exports = This

function $(exceptionArray) {
    
    
    for ( let exc of exceptionArray )
        checkVariable( exc )
    
    function checkVariable( exc ) {
        // important vars
        const value       = getValue       (exc)
        const checkers    = getCheckers    (exc)
        const necessarily = getNecessarily (exc)
        
        // throw error if IMPORTANT var is not defined
        if ( value === undefined )
            if ( necessarily )
                throw new Error("variable is not defined")
            else 
                return
                
        // choose check way
        if ( Array.isArray( checkers ) )
        {
            for ( let chker of checkers )
                if ( !runChecker( value , chker ) )
                    return
            throw new TypeError("variable has wrong type")
                    
        }
        else if ( typeof checkers === "string" || isClass( checkers ) )
        {
            if ( runChecker( value, checkers) )
                throw new TypeError(`typeof variable is ${ typeof value }, but it must be ${ checkers }`)
        }
        else throw new Error("exception has error")
                
        function runChecker( variable , exception ) {
            if ( typeof exception !== "string" )
            
            if ( typeof exception === "string" )
            {
                if ( typeof variable !== exception )
                    return true
            }
            else if ( isClass( exception ) )
            {
                if ( !(variable instanceof exception) )
                    return true
            }
            else throw new TypeError(`typeof exception is ${ typeof exception }, but it must be string or class`)
                
        }
        
        function getValue       ( exc )  { return exc[0] }
        function getCheckers    ( exc )  { return exc[1] }
        function getNecessarily ( exc )  { return exc[2] }
            
    }
    
}
                    
function mkdir(path, pathPre = "") {
    if (path.indexOf("/") === -1) return
    if (nodeFs.existsSync(pathPre + path.slice(0,path.indexOf("/"))))
        mkdir(path.slice(path.indexOf("/")+1), pathPre + path.slice(0,path.indexOf("/")+1))
    else {
        nodeFs.mkdirSync(pathPre + path.slice(0,path.indexOf("/")))
        mkdir(path.slice(path.indexOf("/")+1), pathPre + path.slice(0,path.indexOf("/")+1))
    }
}

function isClass( v ) {
    return typeof v === "function" && v === v.prototype.constructor
}

function createProxyAutoObject( target ) {
    return new Proxy(target, {
        get( target, prop ) {
            if ( prop === "MCFORGE_SYSTEM_TAG_ROOT_OBJECT" ) return target
            if ( !target[prop] ) target[prop] = {}
            return createProxyAutoObject(target[prop])
        }
    })
}
