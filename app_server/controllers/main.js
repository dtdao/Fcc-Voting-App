var express = require("express");
var router = express.Router();
var request = require("request");
var apiOptions = {
	server: "http://localhost:3000"
};

var Chart = require('chart.js');

var _genericError = function(req, res, status){
	var title, message;
	if(status === 404){
		title = "404, Page Not Found";
		message = "Sorry we can't find the page.  Please check again."
	}
	else {
		title = status + ", something has gone wrong";
		message = "In a galaxy far far far away, this page works.  But for now it does not.  Please check everything to see if something has happen.  You are our only hope"; 
	}
	res.status(status);
	res.render("error", {
		message: message,
		title: title
	});
}


///update this when uploading to c9
if(process.env.NODE_ENV === "production"){
	apiOptions.server = "realtestserver.com"
}

//generic json response for testing
var sendJSONresponse = function(res, status, content){
	res.status(status);
	res.json(content);
}

//Render the HomPage 
var renderHomePage = function(req, res, data){
	var message;
	if(!(data instanceof Array)){
		message = "API lookup error";
		data = []
	}else {
		if(!data.length){
			message = "No polls are currently active";
		}
	}
	res.render("index", {
		polls: data,
		message: message
	});	
}

//Handles the calling of the main list of polls when gathering the data from the api
module.exports.pollList = function(req,res){
	var requestOptions, path;
	path = "/api/polls";
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: {}
	};
	request(requestOptions, function(err, response, data){
		if(response.statusCode === 200 && data.length || response.statusCode === 200 && data.length === undefined){
			renderHomePage(req,res,data);
		}else {
			// console.log(response.statusCode)
			// console.log(data.length);
			_genericError(req, res, response.statusCode)
		}
	});
}

var renderPollDetail = function(req, res, data){
		res.render("poll", {title: data.question,
		poll: data
	});
}

module.exports.pollDetail = function(req, res){
	var requestOptions, path;
	path = "/api/poll/" + req.params.pollid;
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: {}
	}
	request(requestOptions, function(err, response, data){
		if(response.statusCode === 200){
			renderPollDetail(req, res, data);
		}
		else {
			_genericError(req, res, response.statusCode);
		}
	})
}

module.exports.addPoll = function(req, res){
	res.render("addPoll", {
		title: "Add a new Poll"
	});
}

module.exports.doAddPoll = function(req, res){
	path = "/api/new/";
	postData = {
		question: req.body.question,
		options: req.body.option
	}
	requestOptions = {
		url: apiOptions.server + path,
		method: "POST",
		json: postData
	}

	// request.post(requestOptions.url, {question: "hello", options: "from thedoaddpoll"}, function(err, response, body){
	// 	if(response.statusCode === 200){
	// 		res.redirect("/");
	// 	}
	// 	else {
	// 		_genericError(req, res, response.statusCode);
	// 	}
	// });
	request(requestOptions, function(err, response, data){
		if(response.statusCode === 200){
			res.redirect("/poll/" + data._id)
		}
		else {
			_genericError(req, res, response.statusCode);
		}		
	})
}

module.exports.doVote = function(req, res){
	var requestOptions, path, postData;
	path = "/api/poll/" + req.params.pollid
	console.log(req.body.pollItem);

	postData = {
		pollid: req.params.pollid,
		pollItem: req.body.pollItem
	}
	requestOptions = {
		url: apiOptions.server + path,
		method: "POST",
		json: postData
	}
	request(requestOptions, function(err, response, data){
		if(response.statusCode === 200){
			res.redirect("/")
		}
		else {
			_genericError(req, res, response.statusCode);
		}
	});
}

module.exports.login = function(req, res){
	var requestOptions, path, postData;
	path = "/api/login/" 
	postData = {
		email: req.body.email,
		password: req.body.password
	}
	requestOptions = {
		url: apiOptions.server + path,
		method: "POST",
		json: postData
	}
	request(requestOptions, function(err, response, data){
		if(response.statusCode === 200){
			sendJSONresponse(res, 200, data);
		}
		else {
			sendJSONresponse(res, response.statusCode, data);
			// console.log("we got to here on the response error server")
			_genericError(req, res, response.statusCode)
		}
	})
}

var renderUserDetail = function(req, res, data){
	res.render("userPage", {userData: data});
}

module.exports.userPolls = function(req, res){

	var requestOptions, path;
	path = "/api/user/" + req.params.userid;
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: {},
	}
	request(requestOptions, function(err, response, data){
		if(response.statusCode === 200){
			renderUserDetail(req, res, data);
		}
		else {
			sendJSONresponse(res, response.statusCode, data)
		}
	})
}

module.exports.register = function(req,res){
	res.render("register", {})
}

module.exports.doRegister = function(req, res){
	sendJSONresponse(res, 200, {"message": "success!"});
}
