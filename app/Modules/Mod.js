const $                     = require('../Util/$')
const createProxyAutoObject = require('../Util/createProxyAutoObject')
const mkdir                 = require('../Util/mkdir')
const { execSync }          = require("child_process")
const osInfo                = require('../Util/os')
const GameVersion           = require('./GameVersion')
const ForgeUtil             = require('./ForgeUtil')

const nodeDel       = require('del')
const nodeFs        = require("fs")
const nodePath      = require("path")
const nodeCopyDir   = require("copy-dir").sync


module.exports = class {
    constructor( args ) {
        $([
            [args.modid                                                                                         , "string"      ,true],
            [args.gameVersion                                                                                   , GameVersion   ,true],
            [args.author                                                                                        , "string"      ,true],
            [args.version?args.version:args.version="1.0"                                                       , "string"           ],
            [args.host?args.host:args.host="me"                                                                 , "string"           ],
            [args.description?args.description:args.description="Minecraft modification created by MCForge.js"  , "string"           ],
            [args.url?args.url:args.url=""                                                                      , "string"           ],
            [args.name?args.name:args.name=args.modid                                                           , "string"           ],
            [args.credits?args.credits:args.credits=""                                                          , "string"           ]
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
        this.dataDir          = args.dataDir
        this.assetsDir        = args.assetsDir

        this.jar              = args.jar
        this.javac            = args.javac


        // important vars
        var modid = this.info.modid

        // create template JAVA packages
        this.JAVAPACKAGESYSTEM = {
            "MCFORGE_SYSTEM_TAG_INCLUDE_LIST" : [],
            "MCFORGE_SYSTEM_TAG_APPEND_LIST" : [],
            "MCFORGE_SYSTEM_TAG_SET_LIST" : [],
            "MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST": [],
            "MCFORGE_SYSTEM_TAG_ROOT_OBJECT_DETECTOR" : true
        }
        this.JAVAPACKAGESYSTEM["MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST"][null] = `@Mod("${modid}")`

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
                        
                        case "append": return  function append( appendParent, appendValue ) {
                            if ( JP.MCFORGE_SYSTEM_TAG_APPEND_LIST === undefined ) JP.MCFORGE_SYSTEM_TAG_APPEND_LIST = {}
                            if ( JP.MCFORGE_SYSTEM_TAG_APPEND_LIST[appendParent] === undefined ) JP.MCFORGE_SYSTEM_TAG_APPEND_LIST[appendParent] = []
                            JP.MCFORGE_SYSTEM_TAG_APPEND_LIST[appendParent].push( appendValue )
                            
                        }
                        
                        case "set": return function set( setValue ) {
                            if ( JP.MCFORGE_SYSTEM_TAG_SET_LIST === undefined ) JP.MCFORGE_SYSTEM_TAG_SET_LIST = []
                            JP.MCFORGE_SYSTEM_TAG_SET_LIST.push( setValue )
                        }
                        
                        case "setPreIniter": return function setPreIniter( preiniterParent, preiniterValue ) {
                            if ( JP.MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST === undefined ) JP.MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST = {}
                            JP.MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST[preiniterParent] = preiniterValue
                            
                        }
                        
                        // open new packages
                        default:
                            if (JP[prop] === undefined) JP[prop] = {}
                            return getJAVAProxyObject(JP[prop])
                            
                        // Error propertyes
                        case "MCFORGE_SYSTEM_TAG_APPEND_LIST"            :
                        case "MCFORGE_SYSTEM_TAG_INCLUDE_LIST"           :
                        case "MCFORGE_SYSTEM_TAG_SET_LIST"               :
                        case "MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST"    :
                        case "MCFORGE_SYSTEM_TAG_ROOT_OBJECT_DETECTOR"   :
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
        if ( this.jar   ) osInfo.JAR_COMMAND   = `"${this.jar}"`
        if ( this.javac ) osInfo.JAVAC_COMMAND = `"${this.javac}"`

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
            if ( pack.MCFORGE_SYSTEM_TAG_APPEND_LIST || pack.MCFORGE_SYSTEM_TAG_INCLUDE_LIST || pack .MCFORGE_SYSTEM_TAG_SET_LIST || pack .MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST)
            {
                // init file
                var JavaOutput = `package ${path};\n\n`
                
                // append includers of file
                if (pack.MCFORGE_SYSTEM_TAG_INCLUDE_LIST)
                    for (let includeString of pack.MCFORGE_SYSTEM_TAG_INCLUDE_LIST)
                        JavaOutput += `import ${includeString};\n`
                        
                // add main preiniter                    
                if (pack.MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST[null])
                    JavaOutput += `\n${pack.MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST[null]}`
                
                // init class
                JavaOutput += `\npublic class ${pack_name} {\n`
                    
                if (pack.MCFORGE_SYSTEM_TAG_SET_LIST)
                    for (let setString of pack.MCFORGE_SYSTEM_TAG_SET_LIST)
                        JavaOutput += `\t${setString}\n\n`
                        
                if (pack.MCFORGE_SYSTEM_TAG_APPEND_LIST)
                    for (let appenderName in pack.MCFORGE_SYSTEM_TAG_APPEND_LIST)
                    {
                        if (pack.MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST[appenderName])
                            JavaOutput += `\t${pack.MCFORGE_SYSTEM_TAG_SET_PRE_INITER_LIST[appenderName]}\n`
                            
                        JavaOutput += `\t${appenderName} { \n`
                            
                        for (let appendString of pack.MCFORGE_SYSTEM_TAG_APPEND_LIST[appenderName])
                            JavaOutput += `\t${appendString}\n\n`
                            
                        JavaOutput += '}'
                    }
                        
                JavaOutput += "}"
                
                mkdir("output/"+path.replace(/\./g, "/") + "/")
                nodeFs.writeFileSync("output/"+path.replace(/\./g, "/") + "/" + pack_name +  ".java", JavaOutput)
            }
            for (let package_index in pack)
            {
                if (typeof pack[package_index] !== "object") continue
                if (pack.MCFORGE_SYSTEM_TAG_ROOT_OBJECT_DETECTOR)
                    loadPackage(pack[package_index], `${path}`, package_index)
                else 
                    loadPackage(pack[package_index], `${path}.${pack_name}`, package_index)
            }


        })( JAVAPACKAGESYSTEM, `${host}.${author}.${modid}`, modid)

        // call ForgeUtil`s functions
        for ( let exportFunction of this.FUNCTIONEXPORTLIST )
            exportFunction.call(this)

        // load assets to jar
        if (this.assetsDir) {
            const assetsPath = `output/assets/${modid}/`
            mkdir(assetsPath)
            nodeCopyDir(this.assetsDir, assetsPath)
        }  
        
        // load data(dir) to jar
        if (this.dataDir) {
            const dataPath = `output/data/${modid}/`
            mkdir(dataPath)
            nodeCopyDir(this.dataDir, dataPath)
        }

        // load files to jar
        for ( let fileInfo of this.FILESAPENDEDTOARCHIVE ) {
            mkdir("output/" + fileInfo.pathArhiveFile)
            if (fileInfo.pathFile)
                nodeFs.writeFileSync("output/" + fileInfo.pathArhiveFile, nodeFs.readFileSync(fileInfo.pathFile))
            else
                nodeFs.writeFileSync("output/" + fileInfo.pathArhiveFile, fileInfo.value)
        }

        // compile .java files -----

        // find .java files
        execSync(osInfo.FINDER_COMMAND, { cwd: "output" })

        // create bash command for compile modification
        var compileCommand = `${osInfo.JAVAC_COMMAND} -classpath `

        // add to command minecraft libraries
        var pathLibraries = this.gameVersion.minecraftMetaJson.getLibraries()
        for (let pathLib of pathLibraries)
            compileCommand += `../${pathLib}${osInfo.PREFIX_COMMAND}`

        // add to command forge libraries
        var pathLibraries = this.gameVersion.forgeMetaJson.getLibraries()
        for (let pathLib of pathLibraries)
            compileCommand += `../${pathLib}${osInfo.PREFIX_COMMAND}`

        // add API as library
        compileCommand += "../" + this.gameVersion.minecraftAPI.getFilePath()

        // add compiled files
        compileCommand += " @sources.txt"

        // send command to console
        execSync(compileCommand, { cwd: "output" } , err => console.log(err))

        // remove .java files by sources.txt
        var javaFiles = nodeFs.readFileSync("./output/sources.txt", "utf-8").split("\n")
        javaFiles.pop()

        for (let file of javaFiles) {
            if (osInfo.OS_DETECTOR === "win32" ) {
                file = file.slice(0, file.length-1)
                nodeFs.unlinkSync(file)
            } else nodeFs.unlinkSync(nodePath.join("output", file))
        }

        // remove helped files
        nodeFs.unlinkSync(nodePath.join("output", "sources.txt"))

        //execSync(`rmdir logs`, { cwd: "output" })

        // arhive mod`s files to jar
        execSync(`${osInfo.JAR_COMMAND} cf ${path?path:"../output.jar"} ./`, { cwd:"./output" })

        // remove mod`s folder
        nodeDel("output")


    }

    includeUtil( forgeUtil ) {
        $([
            [forgeUtil, ForgeUtil, true]
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
