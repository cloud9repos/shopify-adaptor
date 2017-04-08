'use strict'

var util = require("util")
    , mongoose = require("mongoose")
    , Schema = mongoose.Schema
    , ObjectId = require('mongoose').Types.ObjectId
    , dburl = undefined
    , User = undefined
    

var UserSchema = new Schema({
    username: String
    , password: String
    , email: String
    , access_token: String
})

mongoose.model('User', UserSchema)
var User = mongoose.model('User')

module.exports.findById = function(id, callback) {
   User.findOne({"_id" : new ObjectId(id)}, function(err, doc) {
        if(err) callback(err)
        else callback(null, doc)
    })
}

module.exports.findByUsername = function(username, callback) {
    User.findOne({ username: username}, function(err, doc) {
        if(err) callback(err)
        else callback(null, doc)
    })
}

module.exports.create = function(userObj, callback) {
    var newUser = new User()
    newUser.username = userObj.username
    newUser.password = userObj.password
    newUser.email = userObj.email
    newUser.access_token = userObj.access_token
    newUser.scope = userObj.scope
    
    newUser.save(function(err) {
        if(err) callback(err)
        else callback()
    })
}

module.exports.update = function(userObj, callback) {
    userObj.update(function(err) {
        if(err) callback(err)
        else callback()
    })
}