const result = {}
// create info for diferent os
result.JAVAC_COMMAND  = "javac"
result.JAR_COMMAND    = "jar"
if ( require('os').platform() === "win32" ) {
    result.FINDER_COMMAND = 'dir /s /B *.java > sources.txt'
    result.PREFIX_COMMAND = ';'
    result.OS_DETECTOR    = "win32"
} else {
    result.FINDER_COMMAND = 'find . -type f -name "*.java" > sources.txt'
    result.PREFIX_COMMAND = ':'
    result.OS_DETECTOR    = "other"
}
module.exports = result