var express = require('express');
var spawn = require('child_process').spawn;
var fs = require('fs');
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;
const { exec } = require('child_process');
var NodeWebcam = require( "node-webcam" );

// var mysql = require('mysql');

// create mysql db connection
// var con = mysql.createConnection({
// 	host: "localhost",
// 	user: "root",
// 	password: "passw0rd",
// 	database: "HelloCoding"
// });

// create mongodb connection
var url = "mongodb+srv://let-us-shine:Amit@cluster0.l22d9.mongodb.net/CodeBit?retryWrites=true&w=majority";

// creat express server
var app = express();

app.use(cors());
app.set('title', 'CodeBit');
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('src'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function (req, res) {
	res.render('index');
})

app.get('/logout', function (req, res) {
	console.log('Logging out...');
	res.redirect('login.html');
})

app.listen(4000);
console.log('Express Server listening on port 4000.');

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected to local MySQL Database succesfully.");
// });

app.post('/login', function (req, res) {
	
	var username = req.query.username;
	var password = req.query.password;
	
	console.log("username:" + username + ", pass: " + password);


	mongoClient.connect(url, function(err, db){
		if(err)
		{
			console.log("Error ", err);
			return;
		}
		console.log("********************");
		var dbo = db.db("CodeBit");
		var user = {
		username: username,
		password: password
		};
		var collection = dbo.collection("Accounts");
		collection.find({username: username, password: password}).toArray(function(err, result) {
			if(err) throw err;
			var response = {
				success: false,
				message: ""
			};
			console.log(result);
			if(result.length <= 0) {
				response.message = "Invalid Username/Password";
			}
			else {
				response.success = true;
				db.close();
			}
			res.send(response);
		});
	});

	// con.query("select count(*) as pass FROM Accounts WHERE usernames = '" + username + "' and passs = '" + passcode + "';", function (err, rows, fields) {
	// 	if (err) throw err;
		
	// 	// LOGIN ONLY IF CREDENTIALS ARE CORRECT!!!
	// 	if (rows[0].pass == 1) {
			
	// 		console.log("user logged in.");
			
	// 		// Login Pass, now retrieve their level, and render the coding page with the correct activity loaded
	// 		con.query("SELECT currentlevel as currentlevel, starcount as starcount FROM Accounts WHERE usernames = '" + username + "';", function (err, rows, fields) {
	// 			if (err) throw err;
				
	// 			var currentLevel = rows[0].currentlevel;
	// 			var starcount = rows[0].starcount;
				
	// 			// get the activity that is equal to what level we are on
	// 			con.query("SELECT * FROM Activities WHERE level = '" + currentLevel + "';", function (err, rows, fields) {
	// 				if (err) throw err;
					
	// 				var activityName = rows[0].Title;
	// 				var activityQuestion = rows[0].Question;
	// 				var activityStars = rows[0].Stars;
	// 				var startingCode = rows[0].StartingCode;
					
	// 				res.render('home', { outputmessage: "", startingcode: startingCode, success: false, navUsername: username, navStars: starcount, activityName: activityName, activityQuestion: activityQuestion, activityStars: activityStars });
	// 			});
				
	// 		});
			
	// 	} else {
	// 		console.log("failed login attempt.");
	// 		res.render('index');
	// 	}
	// });
	
})
app.post('/register', function (req, res) {
	var username = req.query.username;
	var password = req.query.password;
	var email = req.query.email;
	
	console.log("username:" + username + ", password: " + password + ", email:" + email);



	mongoClient.connect(url, function(err, db){
		if(err)
		{
			console.log("Error ", err);
			return;
		}
		console.log("********************");
		var dbo = db.db("CodeBit");
		var user = {
		username: username,
		email: email,
		password: password
		};
		var collection = dbo.collection("Accounts");
		collection.find({username: username}).toArray(function(err, result) {
			if(err) throw err;
			var response = {
				success: false,
				message: ""
			};
			if(result.length > 0) {
				response.message = "Username not available";
			}
			else {
				collection.insertOne(user, function(err, result){
					if(err) console.log("Insert error ", err);
					else console.log(result);
				});
				response.success = true;
				db.close();
			}
			res.send(response);
		});
	});


	
	// con.query("INSERT INTO Accounts (usernames, email, passs, currentlevel) VALUES ('" + username + "', '" + email + "', '" + passcode + "', '1');", function (err, result) {
	// 	if (err) throw err;
	// 	console.log("Register Result: " + result);
	// 	res.render('index');
	// });
	
})
app.post('/compile', function (req, res) {
	var code = req.query.code;
	code = "#include<bits/stdc++.h>\n" + code;
	code = code.replace(/\n/g, "\n\r");
	console.log(code, "****");
	var username = req.body.username;
	
	fs.writeFile("code.cpp", code, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	exec("g++ code.cpp -o code.exe", (error, stdout, stderr) => {
		var json = {"result" : ""};
		if(error)
		{
		console.log(`error: ${error.message}`);
		res.type('txt');
		res.statusCode = 200;
		json.result = error.message;
		console.log("++++++" + JSON.stringify(json));
		res.send(JSON.stringify(json));
		return;
		}
		if(stderr)
		{
		console.log(`stderr: ${stderr}`);
		json.result = stderr;
		res.send(json);
		return;
		}
		
		var startTime = new Date().getTime();
		exec("code", (error, stdout, stderr) => {
		var endTime = new Date().getTime();
		if(error)
		{
		console.log(`error: ${error.message}`);
		json.result = error.message;
		res.send(json);
		return;
		}
		if(stderr)
		{
		console.log(`stserr: ${stderr}`);
		json.result = stderr;
		res.send(json);
		return;
		}
		console.log(`stdout: ${stdout}`, "Mereko to esa dhak dhak hore la he mast.\n", `\nExecution time: ${(endTime - startTime)} milliseconds\n`);
		json.result = "Executed Successful <br>" + stdout;
		// res.statusCode = 200;
		res.send(json);
		console.log(json);
		}).stdin.end('10 10 10');
		
		});
		

	// var compiler = spawn('g++', ['code.c', '-o', 'code']);

	// compiler.stdout.on('data', function (data) {
	// 	console.log('stdout: ' + data);
	// });

	// compiler.stderr.on('data', function (data) {
	// 	console.log("***COMPILATION ERROR***");
	// 	console.log(String(data));
	// 	res.render('index', { outputmessage: "Compile error: " + data, startingcode: req.body.code })
	// });
	
	// compiler.on('close', function (data) {
		
	// 	if (data === 0) {
			
	// 		var execute = spawn('./code', []);
			
	// 		execute.stdout.on('data', function (output) {
				
	// 			// get the currentlevel from their username
	// 			con.query("SELECT currentlevel as currentlevel, starcount as starcount FROM Accounts WHERE usernames = '" + username + "';", function (err, rows, fields) {
	// 				if (err) throw err;

	// 				var currentLevel = rows[0].currentlevel;
	// 				var starcount = rows[0].starcount;
					
	// 				// get the activity that is equal to what level we are on
	// 				con.query("SELECT * FROM Activities WHERE level = '" + currentLevel + "';", function (err, rows, fields) {
	// 					if (err) throw err;

	// 					var correctAnswer = rows[0].CorrectAnswer;
	// 					var activityStars = rows[0].Stars;
	// 					var activityName = rows[0].Title;
	// 					var activityQuestion = rows[0].Question;

	// 					if (output == correctAnswer) {
	// 						res.render('home', { outputmessage: output, startingcode: req.body.code, success: true, navUsername: username, navStars: starcount, activityName: activityName, activityQuestion: activityQuestion, activityStars: activityStars });
	// 					} else {
	// 						res.render('home', { outputmessage: output, startingcode: req.body.code, success: false, navUsername: username, navStars: starcount, activityName: activityName, activityQuestion: activityQuestion, activityStars: activityStars });
	// 					}

	// 				});

	// 			});
				
	// 		});
			
	// 		execute.stderr.on('data', function (output) {
	// 			//console.log(String(output));
	// 		});
			
	// 		execute.on('close', function (output) {
	// 			//console.log('stdout: ' + output);
	// 		})
	// 	}
	// })

})

app.post('/next', function(req, res){
	
	var username = req.body.username;
	
	// get the currentlevel from their username
	con.query("SELECT currentlevel as currentlevel, starcount as starcount FROM Accounts WHERE usernames = '" + username + "';", function (err, rows, fields) {
		if (err) throw err;

		var currentLevel = rows[0].currentlevel + 1;
		var starcount = rows[0].starcount + 1;
		
		con.query("UPDATE Accounts SET currentlevel = currentlevel + 1, starcount = starcount + 1 WHERE usernames = '" + username + "';", function (err, result) {
			if (err) throw err;
		
			// get the activity that is equal to what level we are on
			con.query("SELECT * FROM Activities WHERE level = '" + currentLevel + "';", function (err, rows, fields) {
				if (err) throw err;

				var correctAnswer = rows[0].CorrectAnswer;
				var activityStars = rows[0].Stars;
				var activityName = rows[0].Title;
				var activityQuestion = rows[0].Question;
				var startingCode = rows[0].StartingCode;

				res.render('home', { outputmessage: "", startingcode: startingCode, success: false, navUsername: username, navStars: starcount, activityName: activityName, activityQuestion: activityQuestion, activityStars: activityStars });

			});

		});

	});
	
})