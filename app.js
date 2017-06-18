var express = require('express');
var bodyParser = require('body-parser');
var expHbs = require('express-handlebars');
var redis  = require('redis')
var methodOverride = require('method-override');
var app = express();

const port = 4000;

let client = redis.createClient();
client.on('connect', function(){
	console.log('conncted to redis...')
})

// view engie
app.engine('handlebars',expHbs({defaultLayout : 'main'}));
app.set('view engine', 'handlebars')


// body parser

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}))


// method override

app.use(methodOverride('_method'));

 // Search home
app.get('/', function(req, res, next){
	console.log("rendering ome page")
 res.render('layouts/searchusers');
});

app.post('/user/search', function(req, res, next){
	console.log('THE BODY IS',req.body)

	let id = req.body.id;
	client.hgetall(id, function(err, obj){
		console.log('err',err,'\n obj ', obj)
		if(!obj){
			res.render('layouts/searchusers',{
				error : 'User does not exist'
			})
		}
		else { 
			obj.id = id;
			res.render('details', { 
				user : obj 
			})
		}
	})
	
})

app.get('/user/add', function(req, res, next){
	console.log('rendering add user page')
	 res.render('layouts/adduser');
});

app.post('/user/add', function(req, res, next){


	console.log("rendering add user")
	console.log("and body for add user is",req.body)
	var formData = req.body;
	let id=  formData.id;
	let first_name = formData.first_name;
	let last_name = formData.last_name;
	let email = formData.email;
	let phone = formData.phone;

	client.hmset(id, [
		'first_name', first_name,
		'last_name', last_name,
		'email', email,
		'phone', phone
		], function(err,reply){
			if(err) {
				console.log(err)
			}
			console.log("redis reply",reply)
			res.redirect('/');
		});
});

app.delete('/user/delete/:id', function(req,res, next){
	client.del(req.params.id);
	res.redirect('/');
});



app.listen(port, function() {
	console.log('server started on port ',port)
});