'use strict'

var LocalStrategy = require("passport-local").Strategy
    , CONST = require("../constants.js")
    , url = require('url')
    , request = require('request')
    , users = undefined
    , passport = undefined
    , username
    , password


exports.configure = function(params) {
    users = params.users
    passport = params.passport
}

module.exports.serialize = function(user, done) {
    done(null, user.id)
}

module.exports.deserialize = function(id, done) {
    users.findById(id, function(err, user) {
        done(err, user)
    })
}

module.exports.strategy = new LocalStrategy(
    function(username, password, done) {
        console.log("inside strategy method")
        process.nextTick(function() {
            users.findByUsername(username, function(err, user) {
                if(err) { return done(err) }
                if(!user) { return done(null, false, {
                    message: 'Unknown user ' + username
                }) }
                if(user.password != password) {
                    return done(null, false, { message: 'Invalid password' })
                }
                return done(null, user)
            })
        })
    }
) 

module.exports.ensureAuthenticated = function(req, res, next) {
    if(req.isAuthenticated()) { return next() }
    return res.redirect('/login')
}

module.exports.postLogin = function(req, res) {
    console.log("root test", req.method)
    console.log("req.body", req.body)
    res.redirect('/')
}

module.exports.doLogout = function(req, res) {
    req.logout()
    res.redirect('/')
}

module.exports.initShopify = function(req, res, next) {
    /*
        req.originalUrl: /initshopify?hmac=355eed27b2fe0119611b03628805eef0bb8c24259df4d17f9cd2fa5b5235a3bb&shop=abhi-1.myshopify.com&timestamp=1476598870
    */
    var url_parts = url.parse(req.originalUrl, true)
        , storeName = extractStoreName(url_parts.query.shop)
        
    //console.log("url_parts", url_parts)
    return checkShopifyConnection(storeName, function(err, isRegisteredClient) {
        if(err) {
            //TODO
            console.log("err 6", err.message)
        }
        if(isRegisteredClient) {
            
            console.log("Inside initShopify, User is registered, redirecting to home page")
            req.body = {username :  storeName, password : CONST.USERS_PASSWORD}
                
            if(url_parts.query.protocol) {
                console.log("redirecting to next")
                next()
            }
            else {
                res.redirect('https://'+ storeName +'.myshopify.com/admin/apps/products-manager-bulk-operations')
            }
        }
        else {
            console.log("Inside initShopify, Redirecting uri to registerClient")
            var redirectShopify = 'https://'+ storeName +'.myshopify.com/admin/oauth/authorize?client_id='+ CONST.CLIENT_ID +'&scope='+ CONST.SCOPE +'&redirect_uri='+ CONST.REDIRECT_URI_REGISTER_CLIENT +'&state=nonce'

            res.redirect(redirectShopify)
        }
    })
    
}

module.exports.registerClient = function(req, res, next) {
    
    var url_parts = url.parse(req.originalUrl, true)
        , storeName = extractStoreName(url_parts.query.shop)
        , auth_code = url_parts.query.code
        
    var requestOpts = {
        uri: 'https://'+ storeName +'.myshopify.com/admin/oauth/access_token',
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
            //TODO: handle error
            console.log("err", err.message)
        }
        
        var userObj = {
            username: storeName
            , password: CONST.USERS_PASSWORD
            , email: ""
            , access_token: body.access_token
            , scope: body.scope
        }
        
        addUpdateUser(userObj, function(err) {
            if(err) {
                //TODO 
                console.log("err 2", err.message)
            }
            req.body = {username :  storeName, password : CONST.USERS_PASSWORD}
            next()
        })
        
    })
}


var 
    extractStoreName = function(shop) {
    var splitedshopdomain = shop.split('.')
        , storeName = ""
        
    for(var j=0; j<splitedshopdomain.length; j++) {
        if(j===0) {
            storeName = storeName + splitedshopdomain[j]
        }
        else if(splitedshopdomain[j] === 'myshopify') break
        else storeName = storeName + splitedshopdomain[j]
    }
        
    return storeName
}
    
    , addUpdateUser = function(userObj, callback) {
        users.findByUsername(userObj.storeName, function(err, doc) {
            if(err) {
                //TODO:
                console.log("err 3", err.message)
            }
            if(!doc) {
                users.create(userObj, function(err) {
                    if(err) {
                        //TODO
                        console.log("err 4", err.message)
                    }
                    return callback()
                })
            }
            else {
                doc.access_token = userObj.access_token
                doc.scope = userObj.scope
                
                users.update(doc, function(err) {
                    if(err) {
                        //TODO
                        console.log("err 5", err.message)
                    }
                    return callback()
                })
            }
        })
    }
    
    , checkShopifyConnection = function(userName, callback) {
        users.findByUsername(userName, function(err, doc) {
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
                uri: 'https://'+ doc.username +'.myshopify.com/admin/products.json',
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
                console.log("res.statusCode", res.statusCode)
                if(res.statusCode == 200) {
                    return callback(null, true)
                }
                else {
                    return callback(null, false)
                }
            })
        })
    }