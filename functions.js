var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'); //config file contains all tokens and other private info

// MongoDB connection information
var mongodbUrl = 'mongodb://' + config.mongodbHost + ':27017/users';
var MongoClient = require('mongodb').MongoClient;

//used in local-signup strategy
exports.localReg = function (username, password) {
    var deferred = Q.defer();
    
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        
        //check if username is already assigned in our database
        collection.findOne({
            'username': username
        })
            .then(function (result) {
                if (null != result) {
                    console.log("USERNAME ALREADY EXISTS:", result.username);
                    deferred.resolve(false); // username exists
                } else {
                    var hash = bcrypt.hashSync(password, 8);
                    var user = {
                        "username": username,
                        "password": hash,
                        "avatar": "https://avatars1.githubusercontent.com/u/5006023?v=3&s=460"
                    }
                    
                    console.log("CREATING USER:", username);
                    
                    collection.insert(user)
                        .then(function () {
                            db.close();
                            deferred.resolve(user);
                        });
                }
            });
    });
    
    return deferred.promise;
};


//used in add-row strategy
exports.addRow = function (areaNum, clientName, clientPhone, counterMark) {
    var deferred = Q.defer();
    
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('electricityPayment');
        
        //check if username is already assigned in our database
        collection.findOne({
            'name': clientName
        })
            .then(function (result) {
                if (null != result) {
                    console.log("client ALREADY EXISTS:", result.clientName);
                    deferred.resolve(false); // username exists
                } else {
                    var client = {
                        "areanum": areaNum,
                        "name": clientName,
                        "phone": clientName,
                        "countermark": counterMark
                    }
                    
                    console.log("CREATING client:", clientName);
                    
                    collection.insert(client)
                        .then(function () {
                            db.close();
                            deferred.resolve(client);
                        });
                }
            });
    });
    
    return deferred.promise;
};

// check if user exists
// if user exists check if passwords match
// (use bcrypt.compareSync(password, hash);
// true where 'hash' is password in DB)
// if password matches take into website
// if user doesn't exist or password doesn't match tell them it failed

exports.localAuth = function (username, password) {
    var deferred = Q.defer();
    
    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');
        
        collection.findOne({
            'username': username
        })
            .then(function (result) {
                if (null == result) {
                    console.log("USERNAME NOT FOUND:", username);
                    
                    deferred.resolve(false);
                } else {
                    var hash = result.password;
                    
                    console.log("FOUND USER: " + result.username);
                    
                    if (bcrypt.compareSync(password, hash)) {
                        deferred.resolve(result);
                    } else {
                        console.log("AUTHENTICATION FAILED");
                        deferred.resolve(false);
                    }
                    
                }
                
                db.close();
            });
    });
    
    return deferred.promise;
}