'use strict'

var util = require("util")
    , mongoose = require("mongoose")
    , Schema = mongoose.Schema
    , ObjectId = require('mongoose').Types.ObjectId
    , Store = undefined
    

var StoreSchema = new Schema({
    storeIdentifier: String,
    createdAt: Date,
    updatedAt: Date,
    access_token: String,
    password: String,
    storeInfo: {
        name: String,
        email: String,
        id: String,
        plan_name: String
    }
})

mongoose.model('Store', StoreSchema)
var Store = mongoose.model('Store')

module.exports.findById = function(id, callback) {
   Store.findOne({"_id" : new ObjectId(id)}, function(err, doc) {
        if(err) callback(err)
        else callback(null, doc)
    })
}

module.exports.findByStoreIdentifier = function(storeIdentifier, callback) {
    Store.findOne({ storeIdentifier: storeIdentifier}, function(err, doc) {
        if(err) callback(err)
        else callback(null, doc)
    })
}

module.exports.create = function(storeObj, callback) {
    var newStore = new Store()
    newStore.createdAt = (new Date()).toString()
    newStore.storeIdentifier = storeObj.storeIdentifier
    newStore.password = storeObj.password
    newStore.access_token = storeObj.access_token
    newStore.storeInfo.name = storeObj.storeInfo.name
    newStore.storeInfo.email = storeObj.storeInfo.email
    newStore.storeInfo.id = storeObj.storeInfo.id
    
    newStore.save(function(err) {
        if(err) callback(err)
        else callback()
    })
}

module.exports.update = function(storeObj, callback) {
    storeObj.updatedAt = (new Date()).toString()
    storeObj.save(function(err) {
        if(err) callback(err)
        else callback()
    })
}