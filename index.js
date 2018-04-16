var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express();
var upload = multer();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(upload.array());
app.use(session({
    secret: "123412341234",
    resave: false,
    saveUninitialized: true
}));

var Users = [];

mongoose.connect('mongodb://localhost:27017/my_db');

var personSchema = mongoose.Schema({
    name: String,
    age: Number,
    nationality: String
});

var Person = mongoose.model("Person", personSchema);

app.get('/signup', function(req, res){
    res.render('signup_view');
});

app.post('/signup', function(req, res){
    if(!req.body.id || !req.body.password)
    {
        res.status("400");
        res.send("Invalid details!");
    }
    else
    {
        Users.filter(function(user){
            if(user.id === req.body.id)
            {
                res.render('signup_view', {
                    message: "User Already Exist! Login or use another user id"
                });
            }
        });
        var newUser = {id: req.body.id, password: req.body.password};
        Users.push(newUser);
        req.session.user = newUser;
        res.redirect('/protected_page');
    }
});

function checkSignIn(req, res, next)
{
    if(req.session.user)
    {
        console.log("This is from custom function " + req.session.user);
        return next();
    }
    else
    {
        var err = new Error("Not Logged in!");
        console.log(req.session.user);
        next(err);
    }
}

app.get('/protected_page', checkSignIn, function(req, res){
    res.render('protected_page_view', {
        id: req.session.user.id
    });
});

app.use('/protected_page', function(err, req, res, next){
    console.log(err);
    res.redirect('/login');
});

app.get('/login', function(req, res){
    console.log(req.session);
    console.log(Users);
    res.render("login_view");
});

app.post('/login', function(req, res){
    console.log(Users);
    if(!req.body.id || !req.body.password)
    {
        res.render('login_view', {
            message: "Please enter both id and password"
        });
    }
    else
    {
        Users.filter(function(user){
            if(user.id === req.body.id && user.password === req.body.password)
            {
                console.log(user);
                req.session.user = user;
                res.redirect('/protected_page');
            }
        });
        res.render('login_view', {
            message: "Invalid credentials"
        });
    }
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.");
    });
    res.redirect('/login');
});

app.get('/session', function(req, res){
    console.log(req.session);
    if(req.session.page_views)
    {
        req.session.page_views++;
        res.send("You visited this page " + req.session.page_views + " times");
    }
    else
    {
        req.session.page_views = 1;
        res.send("Welcome to this page for the first time!");
    }
});

app.get("/cookie", function(req, res){
    res.clearCookie('name').send('Cookie Remove');
    console.log('Cookies : ', req.cookies);
});

app.get('/person', function (req, res) {
    // res.render('person_view');

    Person.find(function(err, response){
        if(err) res.json(err);
        else res.render('show_message', {users: response});
    });
});

app.put('/people/:id', function(req, res){
    console.log(req.body);
    Person.findByIdAndUpdate(req.params.id, req.body, function(err, response){
        if(err)
        {
            res.json({message: "Error in updating person with id "+ req.params.id});
        }
        else
        {
            console.log(response);
        }
    });
});

app.post('/person', function (req, res) {
    var personInfo = req.body;
    console.log(req.body);

    if(!personInfo.name || !personInfo.age || !personInfo.nationality)
    {
        res.render('show_message', {
            message: "Sorry, you provided wrong info",
            type: "error"
        });
    }
    else
    {
        var newPerson = new Person({
            name: personInfo.name,
            age: personInfo.age,
            nationality: personInfo.nationality
        });

        newPerson.save(function(err, Person){
            if(err)
            {
                res.render('show_message', {
                    message: "Database Error",
                    type: "error"
                });
            }
            else
            {
                res.render('show_message', {
                    message: "New person added",
                    type: "success",
                    person: personInfo
                });
            }
        });
    }
});
app.listen(3000);