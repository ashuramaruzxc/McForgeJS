module.exports = function createProxyAutoObject( target ) {
    return new Proxy(target, {
        get( target, prop ) {
            if ( prop === "MCFORGE_SYSTEM_TAG_ROOT_OBJECT" ) return target
            if ( !target[prop] ) target[prop] = {}
            return createProxyAutoObject(target[prop])
        }
    })
}