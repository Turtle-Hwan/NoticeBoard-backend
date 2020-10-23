const mysql = require('mysql');
const express = require('express');
const app = express();

//built-in body-parser
app.use(express.json());             
app.use(express.urlencoded( {extended:false} ))


const fs = require('fs');

//dotenv
require('dotenv').config();
app.set('port', (process.env.SERVER_PORT));


//굳이 html을 쓰기 위해...
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/front');


//router
const main_page = require('./router/main_page');
const signup_page = require('./router/signup_page');



app.get('/', main_page.site_main_get);

app.get('/signup', signup_page.site_signup_get);

app.post('/signup', signup_page.site_signup_post);










app.listen(process.env.SERVER_PORT, function() {
    console.log('express server running on port ' +  process.env.SERVER_PORT);
});