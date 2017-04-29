'use strict'

var LocalStrategy = require("passport-local").Strategy
    , CONST = require("../adpConstants.js")
    , url = require('url')
    , request = require('request')
    , _ = require('lodash')
    , stores = undefined
    , passport = undefined
    , storeIdentifier
    , password


exports.inheritConstant = function(parentConst) {
    _.each(parentConst, function(value, key) {
       CONST[key] = value
    })
}

exports.configure = function(params) {
    stores = params.stores
    passport = params.passport
}

module.exports.serialize = function(store, done) {
    done(null, store.id)
}

module.exports.deserialize = function(id, done) {
    stores.findById(id, function(err, store) {
        done(err, store)
    })
}

module.exports.strategy = new LocalStrategy({usernameField: 'storeIdentifier'},
    function(storeIdentifier, password, done) {
        console.log("inside strategy method")
        process.nextTick(function() {
            stores.findByStoreIdentifier(storeIdentifier, function(err, store) {
                if(err) { return done(err) }
                if(!store) { return done(null, false, {
                    message: 'Unknown store ' + storeIdentifier
                }) }
                if(store.password != password) {
                    return done(null, false, { message: 'Invalid password' })
                }
                return done(null, store)
            })
        })
    }
) 

module.exports.ensureAuthenticated = function(req, res, next) {
    if(req.isAuthenticated()) { return next() }
    return res.redirect('/login')
}

module.exports.postLogin = function(req, res) {
    console.log("inside postLogin")
    res.redirect('/')
}

module.exports.doLogout = function(req, res) {
    console.log("inside  doLogout")
    req.logout()
    res.redirect('/logout')
}

module.exports.initShopify = function(req, res, next) {
    console.log("initShopify")
    /*
        req.originalUrl: /initshopify?hmac=355eed27b2fe0119611b03628805eef0bb8c24259df4d17f9cd2fa5b5235a3bb&shop=abhi-1.myshopify.com&timestamp=1476598870
    */
    var url_parts = url.parse(req.originalUrl, true)
        , domainStoreName = extractStoreName(url_parts.query.shop)
        
    //console.log("url_parts", url_parts)
    return checkShopifyConnection(domainStoreName, function(err, isRegisteredClient) {
        if(err) {
            //TODO
            console.log("err 6", err.message)
        }
        if(isRegisteredClient) {
            
            console.log("Inside initShopify, Store is registered, redirecting to home page")
            req.body = {storeIdentifier :  domainStoreName, password : CONST.STORES_PASSWORD}
                
            if(url_parts.query.protocol) {
                console.log("redirecting to next")
                next()
            }
            else {
                res.redirect('https://'+ domainStoreName +'.myshopify.com/admin/apps/' + CONST.APP_NAME)
            }
        }
        else {
            console.log("Inside initShopify, Redirecting uri to registerClient")
            var redirectShopify = 'https://'+ domainStoreName +'.myshopify.com/admin/oauth/authorize?client_id='+ CONST.CLIENT_ID +'&scope='+ CONST.SCOPE +'&redirect_uri='+ CONST.REDIRECT_URI_REGISTER_CLIENT +'&state=nonce'

            res.redirect(redirectShopify)
        }
    })
    
}

module.exports.registerClient = function(req, res, next) {
    console.log("inside registerClient")
    
    var url_parts = url.parse(req.originalUrl, true)
        , domainStoreName = extractStoreName(url_parts.query.shop)
        , auth_code = url_parts.query.code
        
    var requestOpts = {
        uri: 'https://'+ domainStoreName +'.myshopify.com/admin/oauth/access_token',
        method: 'POST',
        //headers: 
        json: {
            client_id: CONST.CLIENT_ID,
            client_secret: CONST.CLIENT_SECRET,
            code: auth_code
        }
    }
    
    request(requestOpts, function(err, response, body) {
        
        if(err) {
            // TODO: handle error
            console.log("err", err.message)
        }
        
        // TODO: make call to store and update hard coded values
        var storeObj = {
            storeIdentifier: domainStoreName,
            password: CONST.STORES_PASSWORD, 
            access_token: body.access_token,
            storeInfo: {
                name: "testname",
                email: "testemail",
                id: "testid"
            }
        }
        
        addUpdateStore(storeObj, function(err) {
            if(err) {
                //TODO 
                console.log("err 2", err.message)
            }
            req.body = {storeIdentifier :  domainStoreName, password : CONST.STORES_PASSWORD}
            next()
        })
        
    })
}


var 
    extractStoreName = function(shop) {
        var splitedshopdomain = shop.split('.')
            , domainStoreName = ""
            
        for(var j=0; j<splitedshopdomain.length; j++) {
            if(j===0) {
                domainStoreName = domainStoreName + splitedshopdomain[j]
            }
            else if(splitedshopdomain[j] === 'myshopify') break
            else domainStoreName = domainStoreName + splitedshopdomain[j]
        }
            
        return domainStoreName
    },
    
     addUpdateStore = function(storeObj, callback) {
        console.log("inside addUpdateStore")
        stores.findByStoreIdentifier(storeObj.storeIdentifier, function(err, doc) {
            if(err) {
                //TODO:
                console.log("err 3", err.message)
                return callback(err)
            }
            if(!doc) {
                console.log("new====")
                stores.create(storeObj, function(err) {
                    if(err) {
                        //TODO
                        console.log("err 4", err.message)
                    }
                    return callback()
                })
            }
            else {
                console.log("update===")
                doc.access_token = storeObj.access_token
                doc.password = CONST.STORES_PASSWORD
                doc.isChargingConfirmed = storeObj.isChargingConfirmed
                
                stores.update(doc, function(err) {
                    if(err) {
                        //TODO
                        console.log("err 5", err.message)
                    }
                    return callback()
                })
            }
        })
    }
    
    , checkShopifyConnection = function(domainStoreName, callback) {
        stores.findByStoreIdentifier(domainStoreName, function(err, doc) {
            if(err) {
                
                //TODO:
                console.log("err 3", err.message)
            }
            if(!doc) {
                console.log("check 1")
                return callback(null, false)
            }
            
            //ping connection
            var requestOpts = {
                uri: 'https://'+ doc.storeIdentifier +'.myshopify.com/admin/products.json',
                method: 'GET',
                headers: {
                    "X-Shopify-Access-Token": doc.access_token
                },
                json: true
            }
           
            request(requestOpts, function(err, res, body) {
                console.log("inside checkShopifyConnection, making request for ping")
                if(err) {
                    //TODO: handle error
                    console.log("err", err.message)
                }
                
                if(res && res.statusCode == 200) {
                    return callback(null, true)
                }
                else {
                    return callback(null, false)
                }
            })
        })
    }