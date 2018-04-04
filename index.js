var express = require('express');
var app = express();

app.use(express.static('assets'));
app.use(express.static('css'));
app.use(express.static('js'));

app.set('view engine', 'pug');
app.set('views', './views');

//Route handler
app.get('/home', function (req, res) {
    res.render('home_view');
});

app.get('/dynamic', function (req, res) {
    res.render('dynamic_view', {
        user: {name: "Ayush", age: "2"}
    });
});

app.listen(3000);