const sql = require('mysql');
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


//const db = require('./database/db_login');
const db = sql.createConnection({
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
});
db.connect();




app.get('/', main_page.site_main_get);

app.post('/', function(req, res) {
    res.send('post req');

});

app.get('/signup', signup_page.site_signup_get);


//
const qs = require('querystring');


app.post('/signup', (req, res) => {
    res.send("<form action='/signup' method='get' name='redirect_signup'> <button type='submit' name='submit'> 회원가입 완료 </button> </form>");

    var { inputName, inputId, inputPw } = req.body;
    var inputDatas = [inputName, inputId, inputPw];

     //sql
    db.query('SELECT * FROM member WHERE ID = ?', inputId, function (err, rows, fields) {
        if (err) throw console.error();

        for (var i = 0; i < rows.length; i++) {
            console.log(rows[i]);
        }

        if (rows.length == 0) {

            db.query('INSERT INTO member (number, Name, ID, PW) VALUES (null, ?, ?, ?);', inputDatas, function (err, rows, fields) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('********mysql에 입력 완료*******\n' + rows[0]);
                }
            });
        } else {
            res.json('<script>alert("존재하는 아이디입니다");</script>');
        }


    });

    
    


});










app.listen(process.env.SERVER_PORT, function() {
    console.log('express server running on port ' +  process.env.SERVER_PORT);
});