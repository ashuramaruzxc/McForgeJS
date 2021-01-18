"use strict"

const ForgeUtil = require("./ForgeUtil")
 
module.exports = new Proxy ({
    ItemRegister: {}
},{
    get(target, version) {
        let result = {}
        
        for ( let I_UR in target )
            // find suported utils for custom game version
            if ( target[I_UR].gameVersions.includes(version) )
                result[I_UR] = (()=>name=>{
                    target[I_UR].argsForgeUtill.name = name?name:I_UR
                    return new ForgeUtil(target[I_UR].argsForgeUtill)
                    
                })()
        
        return result
    }
})
