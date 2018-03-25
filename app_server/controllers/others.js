var express = require("express");
var router = express.Router();

var sendJSONresponse = function(res, status, content){
	res.status(status);
	res.json(content);
}

module.exports.about = function(req, res){
	sendJSONresponse(res, 200, {"message": "Success"});
}