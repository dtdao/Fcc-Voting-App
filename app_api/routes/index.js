var express = require("express");
var router = express.Router();
var ctrlPolls = require("../controllers/polls");
var ctrlAuth = require("../controllers/authentication")
var jwt = require("express-jwt");
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: "payload"
})

router.get("/user/:userid", ctrlPolls.getUserPolls)

router.get("/polls", ctrlPolls.getPollsList);
router.get("/poll/:pollid", ctrlPolls.getSinglePoll);
router.put("/poll/:pollid", auth, ctrlPolls.addOption);

router.post("/new", auth, ctrlPolls.newPoll);

router.delete("/poll/:pollid", auth, ctrlPolls.deletePoll);
// router.post("/new", auth, function(req, res){
	// res.send(req.body.options);
// });
router.post("/poll/:pollid", ctrlPolls.vote);

router.post("/register", ctrlAuth.register);

router.post("/login", ctrlAuth.login);

module.exports = router;