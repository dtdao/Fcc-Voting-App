var mongoose = require("mongoose");
var Poll = mongoose.model("Poll");
var User = mongoose.model("User");

var sendJSONresponse = function(res, status, content){
	res.status(status);
	res.json(content);
}

module.exports.getPollsList = function(req, res){
	Poll.count({}, function(err, count){
		if(err){
			sendJSONresponse(res, 404, err);
		}
		else if(count > 0) {
			Poll.find({}, "question", function(err, polls){
				if(err){
					sendJSONresponse(res, 404, err)
				}
				else {
					sendJSONresponse(res, 200, polls);
				}
			})
		}else {
			sendJSONresponse(res, 200, {"message": "There are currently no active polls"});
		}
	});
}

module.exports.getSinglePoll = function(req, res){
	if(req.params.pollid && req.params){
		Poll
			.findById(req.params.pollid)
			.exec(function(err, poll){
				if(!poll){
					sendJSONresponse(res, 404, {"message": "poll not found"})
					return;
				}
				else if (err){
					sendJSONresponse(res, 404, err);
					return;
				}
				sendJSONresponse(res, 200, poll);
			})
		}
		else {
			sendJSONresponse(res, 404, {"message": "No pollid in request!"});	
		}
}

module.exports.newPoll = function(req, res){
	getUser(req, res, function(req, res, userName){
		var nonempty = checkOptions(req.body.options);
		if(req.body.options.length >= 2 && req.body.question !== "" && nonempty){
			var optionArray = [];
			for(var i = 0; i < req.body.options.length; i++){
				if(req.body.options[i]){
					optionArray.push({option: req.body.options[i]});
				}
			}
			Poll
				.create({
					question: req.body.question,
					options: optionArray,
					//username is the _id 
					author: userName
				}, function(err, poll){
					console.log(err);
					if(err){
						sendJSONresponse(res, 400, err);
						return;
					}
					else {
						console.log(poll);
						sendJSONresponse(res, 200, poll);
						return;
					}
			});
		}
		if(req.body.question === ""){
			sendJSONresponse(res, 400, {
				"message": "You need a question!"
			});
			return;
		}
		if(!nonempty){
			sendJSONresponse(res, 400, {
				"message": "You need more options!"
			});
			console.log(req.body.options)
		}
	});

}

module.exports.deletePoll = function(req, res){
	getUser(req, res, function(req, res, userName){
		var pollid = req.params.pollid;
		if(pollid && req.params){
			Poll
				.findByIdAndRemove(pollid)
				.exec(function(err, poll){
					if(err){
						sendJSONresponse(res, 404, err)
						return;
					}
					sendJSONresponse(res, 200, {
						"message": "You successfully deleted a poll "
					})
				});
		}
		else {
			sendJSONresponse(res, 404, {
				"message": "No poll found!"
			})
		}
	});
}


module.exports.addOption = function(req, res){
	getUser(req, res, function(req, res, userName){
		var newOption = req.body.newOption;
		console.log(newOption);
		var pollid = req.params.pollid;
		if(pollid && req.params){
			Poll
				.findByIdAndUpdate(pollid)
				.exec(function(err, doc){
					if(err){
						sendJSONresponse(res, 404, err)
						return;
					}
					console.log(doc.options);
					doc.options.push( {"option": newOption} );
					doc.save(function(req,req) { 
						sendJSONresponse(res, 200, {
							"message": "You successfully added an option to poll "+doc.question
						})
					})
				})
		}
		else {
			sendJSONresponse(res, 404, {
				"message": "No poll found!"
			})
		}
	});
}

//this route would modify the and use to calculate the votes. 
module.exports.vote = function(req, res){
	var pollid = req.body.pollid;
	var pollitem = req.body.pollItem
	if(pollid){
		Poll
			.findById(pollid)
			.select("options")
			.exec(function(err, poll){
				if(err){
					sendJSONresponse(res, 400, err)
				}
				else {
					//req.body.pollItem gives me the id value of a option
					//when the submit button is pushed.
					doVote(req, res, poll, req.body.pollItem);
					updateTotal(pollid);
				}
			})
	}
}


module.exports.getUserPolls = function(req, res){
	User
		.findById(req.params.userid, "name")
		.exec(function(err, user){
			if(err){
				sendJSONresponse(res, 400, err)
			}else {
				var user = user;
				Poll.count({}, function(err, count){
					console.log(user);
					if(err){
						sendJSONresponse(res, 400, err)
					}
					else if(count > 0 && user){
						Poll
							.find({author: req.params.userid}, "question totalVotes", function(err, polls){
								if(err){
									sendJSONresponse(res, 400, err);
								}
								else {
									sendJSONresponse(res, 200, data = {author: user, polls: polls});
								}
							})
					}
					else {
						sendJSONresponse(res, 200, {"message": "There are currently no active polls!"})
					}
				})
			}
		});
}

var updateTotal = function(pollid){
	Poll
		.findById(pollid)
		.select("totalVotes question")
		.exec(function(err,poll){
			if(err){
				sendJSONresponse(res, 400, err)
			}
			else {
				poll.totalVotes++;
				poll.save(function(err){
					if(err){
						sendJSONresponse(res, 400, err)
					}
					else{
						console.log("Total Votes for " + poll.question + " has been updated.");
					}
				})
			}
		})
}

var doVote = function(req, res, poll, option){
	if(!poll){
		sendJSONresponse(res, 404, {
			"message": "pollid not found"
		});
	}else {
		poll.options.id(option).votes++;
		poll.save(function(err){
			if(err){
				sendJSONresponse(res, 400, err)
			}
			else {
				sendJSONresponse(res, 200, {"message": "You just voted for " + poll.options.id(option).option })
			}
		})
	}
}

var getUser = function(req ,res, callback){
	if(req.payload && req.payload.email){
		User
			.findOne({email: req.payload.email})
			.exec(function(err, user){
				if(!user){
					sendJSONresponse(res, 404, {
						"message": "User not found"
					});
					return
				}
				else if(err){
					sendJSONresponse(res, 404, err);
					return;
				}
				callback(req, res, user._id);
			});
	}
	else {
		sendJSONresponse(res, 404, {
			"message": "User not found"
		});
		return;
	}
}

var checkOptions = function(optionsarray){
	var nonemptyCount = 0;
	for(var i = 0; i < optionsarray.length; i++){
		if(optionsarray[i] !== ""){
			nonemptyCount++
			if(nonemptyCount === 2){
				return true;
			}
		}
	}
	console.log(nonemptyCount)
	return false;
}
