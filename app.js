//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


mongoose.connect("mongodb://localhost:27017/UserDB");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

//first need to create session obj for our application then need to initialize passport & then created session obj can be used by passport package.
app.use(session({
	secret: "This is our secret.",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
});
userSchema.plugin(passportLocalMongoose);

// console.log(process.env.SECRET);
// userSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields:['password']});
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(3000, () => {
	console.log("Application Running on port 3000");
});

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/secrets", (req, res) => {
	if(req.isAuthenticated()){
		res.render("secrets");
	}else{
		res.redirect("/login");
	}
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.post("/register", (req, res) => {

	User.register({username: req.body.username},req.body.password,function(err,user){
		if(err){
			console.log(err);
			res.redirect("/register");
		}else{
			passport.authenticate("local")(req,res,function(){
				res.redirect("/secrets");
			});
		}
	});

});

app.post("/login", function (req, res) {
	const user = new User({
		username: req.body.username,
		password: req.body.password
	});

	req.login(user,function(err){
		if(err){
			console.log(err);
			res.redirect("/login");
		}else{
			passport.authenticate("local")(req,res,function(){
				res.redirect("/secrets");
			});
		}
	})
});


app.get("/logout",function(req,res){
	req.logout(function(err){
		if(err){
			console.log(err);
		}
	});
	res.redirect("/login");
});