const isClass = require('./isClass')
module.exports = function $(exceptionArray) {


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

                if ( typeof exception === "string" ) {
                    if ( typeof variable !== exception )
                        return true
                } else if ( isClass( exception ) ) {
                    if ( !(variable instanceof exception) )
                        return true
                } else throw new TypeError(`typeof exception is ${ typeof exception }, but it must be string or class`)
        }

        function getValue       ( exc )  { return exc[0] }
        function getCheckers    ( exc )  { return exc[1] }
        function getNecessarily ( exc )  { return exc[2] }

    }

}