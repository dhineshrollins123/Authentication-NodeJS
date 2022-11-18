//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

mongoose.connect("mongodb://localhost:27017/UserDB");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
});
console.log(process.env.SECRET);
userSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields:['password']});

const User = new mongoose.model("User", userSchema);

app.listen(3000, () => {
	console.log("Application Running on port 3000");
});

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.post("/register", (req, res) => {
	const user = new User({
		email: req.body.username,
		password: req.body.password,
	});

	user.save(function (err) {
		if (err) {
			console.log(err);
		} else {
			res.render("secrets");
		}
	});
});

app.post("/login", function (req, res) {
	User.findOne({ email: req.body.username }, function (err, result) {
		if (err) {
			console.log(err);
		} else {
			if (result != null) {
				if (result.password === req.body.password) {
					console.log("Password Matched");
                    res.render("secrets");
				} else {
					console.log("Password Not Matched");
				}
			}else{
                console.log("Entered EmailId is Not present !");
            }
		}
	});
});
