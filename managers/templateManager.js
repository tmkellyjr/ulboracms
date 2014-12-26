//categoryManager


var db = require('../db/db');
var manager = require('../managers/manager');


/**
 * 
 * @param json
 *      
 */
exports.create = function (json, callback) {
    var returnVal = {
        success: false,
        message: ""
    };
    var isOk = manager.securityCheck(json);
    if (isOk) {
        if (json.defaultTemplate) {
            removeDefaultTemplate(function (deleteSuccess) {
                console.log("adding template: " + deleteSuccess);
                if (deleteSuccess) {
                    addTemplate(json, function (addResults) {
                        callback(addResults);
                    });
                } else {
                    callback(returnVal);
                }
            });
        } else {
            addTemplate(json, function (addResults) {
                callback(addResults);
            });
        }

    } else {
        callback(returnVal);
    }
};


/**
 * 
 * @param json
 *      
 */
exports.update = function (json, callback) {
    var returnVal = {
        success: false,
        message: ""
    };
    var isOk = manager.securityCheck(json);
    if (isOk) {
        if (json.defaultTemplate) {
            removeDefaultTemplate(function (deleteSuccess) {
                console.log("updating template: " + deleteSuccess);
                if (deleteSuccess) {
                    updateTemplate(json, function (addResults) {
                        callback(addResults);
                    });
                } else {
                    callback(returnVal);
                }
            });
        } else {
            updateTemplate(json, function (addResults) {
                callback(addResults);
            });
        }
    } else {
        callback(returnVal);
    }
};


/**
 * 
 * @param id
 *      
 */
exports.delete = function (id, callback) {
    var returnVal = {
        success: false,
        message: ""
    };
    var isOk = manager.securityCheck(id);
    if (isOk) {
        console.log("id: " + id);
        var Template = db.getTemplate();
        Template.findById(id, function (err, results) {
            console.log("found template for delete: " + JSON.stringify(results));
            if (!err && (results !== undefined && results !== null)) {
                if (!results.defaultTemplate) {
                    results.remove();
                    returnVal.success = true;
                    callback(returnVal);
                } else {
                    returnVal.message = "can not delete default template";
                    callback(returnVal);
                }
            } else {
                callback(returnVal);
            }
        });
    } else {
        callback(returnVal);
    }
};


/**
 * 
 * @param id
 *      
 */
exports.get = function (id, callback) {
    var isOk = manager.securityCheck(id);
    if (isOk) {
        console.log("id: " + id);
        var Template = db.getTemplate();
        Template.findById(id, function (err, results) {
            console.log("found template: " + JSON.stringify(results));
            if (!err && (results !== undefined && results !== null)) {
                callback(results);
            } else {
                callback({});
            }
        });
    } else {
        callback({});
    }
};


/**
 * 
 * @param json
 *      
 */
exports.list = function (callback) {
    var Template = db.getTemplate();
    Template.find({}, null, {sort: {name: 1}}, function (err, results) {
        console.log("found template list: " + JSON.stringify(results));
        if (err) {
            callback({});
        } else {
            if (results !== undefined && results !== null) {
                callback(results);
            } else {
                callback({});
            }
        }
    });
};

exports.upload = function (body, files, callback) {
    var returnVal = "";
    //var templateJson = {
    //name: "",
    //extension: "",
    //fileSize: 0,
    //fileData: null
    //};
    var errorLink = body.errorLink;
    var isOk = manager.securityCheck(body);
    if (isOk) {
        var username = body.username;
        //var name = body.name;
        var angularTemplate = body.angularTemplate;
        var uploadKey = body.uploadKey;
        var returnLink = body.returnLink;
        
        if (files !== undefined && files !== null &&
                username !== undefined && username !== null &&
                uploadKey !== undefined && uploadKey !== null &&
                manager.validateFileUploadKey(username, uploadKey)) {
            var fs = require('fs');
            fs.readFile(files.file.path, function (err, data) {
                if (!err && data !== undefined && data !== null) {
                    var fileName = files.file.name;
                    var indexOfDot = fileName.lastIndexOf(".");
                    //var extension = fileName.substring(++indexOfDot);
                    var name = fileName.substring(0, indexOfDot);
                    //mediaJson.extension = extension;
                    //mediaJson.fileSize = files.file.size;
                    //mediaJson.fileData = data;
                    installTemplate(fileName, data, function (success) {
                        if (success) {
                            var templateJson = {
                                name: null,
                                defaultTemplate: false,
                                angularTemplate: null
                            };
                            templateJson.name = name;
                            templateJson.angularTemplate = angularTemplate;
                            addTemplate(templateJson, function (addResults) {
                                if (addResults.success) {
                                    returnVal = returnLink;
                                    callback(returnVal);
                                } else {
                                    returnVal = errorLink;
                                    callback(returnVal);
                                }

                            });
                        } else {
                            returnVal = errorLink;
                            callback(returnVal);
                        }
                    });

                    var templateJson = {
                        name: null,
                        defaultTemplate: false,
                        angularTemplate: null
                    };
                    templateJson.name = name;
                    templateJson.angularTemplate = angularTemplate;
                    addTemplate(templateJson, function (addResults) {
                        callback(addResults);
                    });

                } else {
                    returnVal = errorLink;
                    callback(returnVal);
                }
            });
        } else {
            returnVal = errorLink;
            callback(returnVal);
        }
    } else {
        returnVal = errorLink;
        callback(returnVal);
    }
};


addTemplate = function (json, callback) {
    var returnVal = {
        success: false,
        message: ""
    };
    if (json.defaultTemplate === undefined || json.defaultTemplate === null) {
        json.defaultTemplate = false;
    }
    if (json.angularTemplate === undefined || json.angularTemplate === null) {
        json.angularTemplate = false;
    }
    var Template = db.getTemplate();
    var temp = new Template(json);
    temp.save(function (err) {
        if (err) {
            returnVal.message = "save failed";
            console.log("template save error: " + err);
        } else {
            returnVal.success = true;
        }
        callback(returnVal);
    });
};

updateTemplate = function (json, callback) {
    var returnVal = {
        success: false,
        message: ""
    };
    console.log("json1: " + JSON.stringify(json));
    if (json.defaultTemplate === undefined || json.defaultTemplate === null) {
        json.defaultTemplate = false;
    }
    if (json.angularTemplate === undefined || json.angularTemplate === null) {
        json.angularTemplate = false;
    }
    var Template = db.getTemplate();
    Template.findById(json.id, function (err, results) {
        console.log("found template: " + JSON.stringify(results));
        if (!err && (results !== undefined && results !== null)) {
            var abortUpdate = false;
            if (results.defaultTemplate && !json.defaultTemplate) {
                abortUpdate = true;
            }
            if (!abortUpdate) {
                results.name = json.name;
                console.log("json2: " + JSON.stringify(json));
                results.defaultTemplate = json.defaultTemplate;
                results.angularTemplate = json.angularTemplate;
                console.log("results: " + JSON.stringify(results));
                results.save(function (err) {
                    if (err) {
                        returnVal.message = "update failed";
                        console.log("template update error: " + err);
                    } else {
                        returnVal.success = true;
                    }
                    callback(returnVal);
                });
            } else {
                callback(returnVal);
            }
        } else {
            callback(returnVal);
        }
    });
};

removeDefaultTemplate = function (callback) {
    var Template = db.getTemplate();
    Template.find({defaultTemplate: true}, function (err, results) {
        console.log("found default templates in create: " + JSON.stringify(results));
        if (!err && (results !== undefined && results !== null)) {
            var doCallback = false;
            if (results.length === 0) {
                callback(true);
            }
            for (var cnt = 0; cnt < results.length; cnt++) {
                if (cnt === (results.length - 1)) {
                    doCallback = true;
                }
                var temp = results[cnt];
                temp.defaultTemplate = false;
                temp.save(function (err) {
                    if (err) {
                        console.log("template update error: " + err);
                    }
                    if (doCallback) {
                        callback(true);
                    }
                });
            }

        } else {
            callback(false);
        }
    });
};

installTemplate = function (fileName, data, callback) {

};