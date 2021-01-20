module.exports = function isClass( v ) {
    return typeof v === "function" && v === v.prototype.constructor
}