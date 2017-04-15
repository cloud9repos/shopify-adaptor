'use strict'

var 
    express = require('express')
  , http = require('http')
  , path = require('path')
  , flash = require("connect-flash")
  , passport = require("passport")
  , LocalStrategy = require("passport-local")
  , CONST = require("./adpConstants.js")
  , _ = require('lodash')
  
  // Models
  , mongoConnect = require("./adp-mongoose/mongoConnect")
  , storesModel = require("./adp-mongoose/stores")
  
  //Routes
  , routes = require('./routes')
  , storesRoutes = require("./routes/stores")



var app = express();

exports.adpInitConfig = function(parentConst) {
  storesRoutes.inheritConstant(parentConst)
  routes.inheritConstant(parentConst)
  
  //passport configuration
  passport.serializeStore(storesRoutes.serialize)
  passport.deserializeStore(storesRoutes.deserialize)
  passport.use(storesRoutes.strategy)
  
  // configure store routes
  storesRoutes.configure({
    stores: storesModel
    , passport: passport
  })
  
}

exports.inheritConstant = function(parentConst) {
    _.each(parentConst, function(value, key) {
       CONST[key] = value 
    })
}

exports.adpMongoConnect = function(config, callback) {
  mongoConnect.connect(config.MONGODB_URI, function(err) {
  if(err) return callback(err)
  
  return callback()
})
}

exports.adpInitRoutes = function(config) {
  //app routes
  app.get('/', routes.index)
  
  //handle logout
  app.get('/logout', storesRoutes.doLogout)
  
  //check registered client and do login
  app.get('/initshopify'
    , storesRoutes.initShopify
    , passport.authenticate('local', {failureRedirect: '/fail', failureFlash: true})
    , storesRoutes.postLogin)
  
  //redirect uri to get access token
  app.get('/registerclient'
    , storesRoutes.registerClient
    , passport.authenticate('local', {failureRedirect: '/fail', failureFlash: true})
    , storesRoutes.postLogin)
    
}

exports.app = app

exports.adpConfigureApp = function(config) {
  /*
    viewPath: '/node_modules/ui-product-manager'
    staticPath: '/node_modules/ui-product-manager'
  */
  
  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, config.viewPath));
    app.engine('html', require('ejs').renderFile)
    
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser())
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat'}))
    app.use(flash())
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(app.router);
    app.use(express.static(path.join(__dirname, config.staticPath)))
  })
}

exports.adpCreateServer = function (config, callback) {
  var server = http.createServer(app)
  
  server.listen(app.get('port'), function(){
    console.log("Express server: " + JSON.stringify(server.address()))
    
  })
  
  return callback()
}

