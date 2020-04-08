exports.logInfo = function(text) {
    console.log(`\x1b[1m[SYSTEM]\x1b[2m ${text}\x1b[0m`)
}

exports.logWarn = function(text) {
    console.log(`\x1b[33m\x1b[1m[WARN]\x1b[2m ${text}\x1b[0m`)
}

exports.logErr = function(text, stackTrace) {
    console.log(`\x1b[31m\x1b[1m[ERROR]\x1b[2m ${text}`)
    console.log(`${stackTrace}\x1b[0m`)
}

exports.logFatal = function(text, stackTrace) {
    console.log(`\x1b[31m\x1b[5m\x1b[1m=== FATAL ERROR ===`)
    console.log(`\x1b[0m\x1b[1m\x1b[31m${text}`)
    console.log(`${stackTrace}`)
    console.log(`Pinup will now close\x1b[0m`)
}
