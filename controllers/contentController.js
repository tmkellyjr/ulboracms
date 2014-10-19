//contentController
var db = require('../db/db');
var manager = require('../managers/manager');
var contentManager = require('../managers/contentManager');
var publicUserManager = require('../managers/publicUserManager');
var atob = require('atob');//base64 to json

exports.getContentList = function (req, filter, loggedIn, callback) {
    var creds = {
        loggedIn: loggedIn
    };
    console.log("filter data in content list: " + JSON.stringify(filter));
    var browserLan = req.headers["accept-language"];
    var locations = [];
    locations.push("FrontPage");
    var Location = db.getLocation();
    Location.find({}, function (err, locs) {
        if (!err && locs !== undefined && locs !== null) {
            for (var locCnt = 0; locCnt < locs.length; locCnt++) {
                var foundLoc = locs[locCnt];
                locations.push(foundLoc.name);
            }
        }
        contentManager.getContentList(filter, creds, browserLan, function (result) {
            console.log("in callback");
            console.log("articleLocation: " + JSON.stringify(result));
            for (var lcnt = 0; lcnt < locations.length; lcnt++) {
                var locName = locations[lcnt];
                console.log("location:" + locName);
                for (var cnt = 0; cnt < result.articleLocations[locName].length; cnt++) {
                    console.log("location array all:" + JSON.stringify(result.articleLocations));
                    console.log("location array:" + JSON.stringify(result.articleLocations[locName]));
                    console.log("location before conversion html:" + result.articleLocations[locName][cnt].articleText.text);
                    if (result.articleLocations[locName][cnt].articleText.processed === undefined || result.articleLocations[locName][cnt].articleText.processed === null) {
                        result.articleLocations[locName][cnt].articleText.text = atob(result.articleLocations[locName][cnt].articleText.text);
                        console.log("location after conversion html:" + result.articleLocations[locName][cnt].articleText.text);
                        result.articleLocations[locName][cnt].articleText.processed = true;
                    }

                }
            }

            callback(result);
        });
    });


};


exports.getArticle = function (req, loggedIn, callback) {
    var creds = {
        loggedIn: loggedIn
    };
    var id = req.query.id;
    contentManager.getArticle(id, creds, function (results) {
        results.articleText.text = atob(results.articleText.text);
        results.user.password = "";
        callback(results);
    });
};

exports.login = function (req, callback) {
    var json = {
        username: null,
        password: null
    };
    var u = req.body.username;
    var p = req.body.password;
    if (u !== undefined && u !== null && p !== undefined && p !== null) {
        json.username = u;
        json.password = p;        
        console.log("login request: " + json);
        publicUserManager.login(json, function (loginStatus) {            
            //console.log("login success: " + returnVal);
            console.log("exit service login success: " + loginStatus);
            callback(loginStatus);
        });
    } else {
        callback(false);
    }


};