var passport = require("passport");

//.Stragey unlocks for strategy
var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var User = mongoose.model("User");

passport.serializeUser(function(user, done){
	done(null, user.email);
});

passport.deserializeUser(function(email, done){
	User.findOne({email: email}, function(err, user){
		done(err, user);
	})
})

passport.use(new LocalStrategy({
	usernameField: "email"
	},
	function(username, password, done){
		User.findOne({email: username}, function(err, user){
			if(err) { return done(err);}
			if(!user){
				return done(null, false, {
					message: "Incorrect username"
				})
			}
			if(!user.validPassword(password)){
				return done(null, false, {
					message: "Incorect password"
				});
			}
			return done(null, user)
	})	
}));