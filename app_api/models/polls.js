var mongoose = require("mongoose");

var optionSchema = new mongoose.Schema({
	option: String,
	votes: {type: Number, "default": 0}
})

var pollSchema = new mongoose.Schema({
	question: {type: String, required: true},
	options: [optionSchema],
	totalVotes: {type: Number, "default": 0},
	author: String
})


mongoose.model("Poll", pollSchema)