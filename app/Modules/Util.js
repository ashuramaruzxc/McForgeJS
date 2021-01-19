"use strict"

const ForgeUtil = require("./ForgeUtil")
 
module.exports = new Proxy ({
    SimpleRegistry: {
        gameVersions: ["1.15"],
        argsForgeUtil: {
            includeFunc() {
                
                // setting EventBusSubscriber
                this.JAVA.events.RegistryEvents.include("net.minecraftforge.fml.common.Mod")
                this.JAVA.events.RegistryEvents.appendPreIniter(null, `@Mod.EventBusSubScriber(bus=Mod.EventBusSubScriber.Bus.MOD)`)
                
                // setting ResourceNameLocator
                this.JAVA.events.RegistryEvents.include("net.minecraft.util.ResourceLocation")
                this.JAVA.events.RegistryEvents.set(`public static ResourceLocation location(String name) { return new ResourceLocation(${this.info.modid}, name) }`)
                
                
            },
            exportFunc() {},
            getOuterElements() {
                
                let outerElements = {}
                
                outerElements.RegistryEntry = new Proxy({},{
                    get(target, prop) {
                        
                        var result = //TODO
                             {
                            "___TAG_ENTRY_NAME___":prop,
                            "___TAG_SIMPLE_REGISTRY_ELEMENT___": true,
                            "___TAG_PROPERTIES_LIST___": []
                        }
                        
                        result.Properties = new Proxy(function(){},{
                            apply() {
                                return createAfterPropertiesGetElement()
                            }
                        })
                        
                        return result
                        
                        function createAfterPropertiesGetElement() {
                            return new Proxy({},{
                                get(target, prop) {
                                    var listResult = ""
                                    listResult += prop
                                    return new Proxy(function(){}, {
                                        apply(target, args) {
                                            
                                            listResult += '('
                                            
                                            for (let item of args)
                                                if ( item && item["___TAG_SIMPLE_REGISTRY_ELEMENT___"] === true ) {
                                                    
                                                    listResult += item["___TAG_SIMPLE_REGISTRY_OUT_STRING___"]
                                                    this.JAVA.events.RegistryEvents.include(item["___TAG_SIMPLE_REGISTRY_IMPORT_STRING___"])
                                                    
                                                } else if (typeof item === "string") {
                                                    
                                                    listResult += `"${item}"`
                                                    
                                                } else if (typeof item === "number") {
                                                    
                                                    listResult += `${item}`
                                                    
                                                } else 
                                                    throw new TypeError("You enter not right arguments")
                                                    
                                            listResult += ')'
                                            
                                            result["___TAG_PROPERTIES_LIST___"].push(listResult)
                                            return createAfterPropertiesGetElement()
                                        }
                                    })
                                }
                            })
                            
                        }
                        
                    }
                })
                
                return outerElements
            } ,
            innerElements: {
                registry() {
                    
                }
            }
        }
    }
},{
    get(target, version) {
        let result = {}
        
        for ( let I_UR in target )
            // find suported utils for custom game version
            if ( target[I_UR].gameVersions.includes(version) )
                result[I_UR] = (()=>name=>{
                    target[I_UR].argsForgeUtil.name = name?name:I_UR
                    return new ForgeUtil(target[I_UR].argsForgeUtil)
                    
                })()
        
        return result
    }
})
