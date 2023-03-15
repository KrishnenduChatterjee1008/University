const express = require('express');
const { Client } = require('pg');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
let alert = require('alert');
const port = process.env.PORT || 5000;
const app = express();

const client = new Client({
  user: 'adminuser',
  host: 'node-test-tan.postgres.database.azure.com',
  database: 'postgres',
  password: 'Qwerty@123',
  port: 5432,
  ssl: {rejectUnauthorized: false}
})

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));

const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

var session;

app.get('/',(req,res) => {
    session = req.session;
    console.log(session.userid);
    console.log(session.isloggedIn);
    if(session.isloggedIn){
        res.sendFile(__dirname + '/mainpage/index.html');
    }else{
    res.sendFile(__dirname + '/public/index.html');}
});

client.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get('/form', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('mainpage'));

app.post('/formPost', (req, res) => {
    let qur = "SELECT email,password FROM admin1 where email like '" + req.body.t1+"'";
    client.query(qur).then(res1 => {
        console.log(res1.rows[0]['password'].type+" "+req.body.t2);
        console.log(res1.rows[0]['password'].toString() == req.body.t2);
        if (res1.rows[0]['password'].toString() == req.body.t2)
        {
            session = req.session;
            session.userid = req.body.t1;
            session.isloggedIn = true;
            console.log(req.session);
            res.redirect('/mainpage');
        }
        else {
            alert("Invalid Id or Password");
            res.sendFile(__dirname + '/public/index.html');
        }
    })

});

app.get('/mainpage', (req, res) => {
    session = req.session;
    if (session.isloggedIn) {
        res.sendFile(__dirname + '/mainpage/index.html');
    }else{
    res.sendFile(__dirname + '/public/index.html');}
});

app.get('/contactus', (req, res) => {
    session = req.session;
    if (session.isloggedIn) {
        res.sendFile(__dirname + '/mainpage/contactus.html');
    }else{
    res.sendFile(__dirname + '/public/index.html');}
});

app.post('/contactusdata', (req, res) => {
    let x = Math.random() * 100000;
    let qur = "INSERT INTO contactus(id, first_name, last_name, email, message) VALUES (" + x + ",'" + req.body.first_name + "', '" + req.body.last_name + "','" + req.body.email + "','" + req.body.message + "')";
    client.query(qur).then(res1 => {
        alert("We will contact you soon");
        res.redirect('/contactus');
    });

});

app.get('/logout',(req,res) => {
    req.session.destroy();
    console.log(req.session);
    res.redirect('/');
});

app.listen(port, () => {
    console.log("Server started");
});