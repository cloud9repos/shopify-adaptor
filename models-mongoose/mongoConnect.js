'use strict'

var util = require("util")
, mongoose = require("mongoose")
, dburl = undefined

exports.connect = function(thedburl, callback) {
    dburl = thedburl
    mongoose.connect(dburl)
    callback(null)
}

exports.disconnect = function(callback) {
    mongoose.disconnect(callback)
}