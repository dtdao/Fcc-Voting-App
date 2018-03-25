var express = require('express');
var router = express.Router();
var ctrlMain = require("../controllers/main");
var otherCtrl = require("../controllers/others");


/* GET home page. */
router.get("/", ctrlMain.pollList);


//get the about page.
router.get("/about", function(req,res){
	res.render("about", {
		title: "All About this App"
	})
});

router.post("/login", ctrlMain.login)

router.get("/user/:userid", ctrlMain.userPolls)

//new poll
router.get("/new", ctrlMain.addPoll);
//make new poll
router.post("/new", ctrlMain.doAddPoll);

//pollDetails
router.get("/poll/:pollid", ctrlMain.pollDetail);
//Do a vote
router.post("/poll/:pollid", ctrlMain.doVote);

//get the register a new user
router.post("/register", ctrlMain.doRegister);

module.exports = router;
