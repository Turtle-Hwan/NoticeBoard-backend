const sql = require('mysql');
const express = require('express');
const app = express();

//built-in body-parser
app.use(express.json());             
app.use(express.urlencoded( {extended:false} ))

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
db.connect();   //각각의 app. 콜백마다 connect 해주면 중복 일어남!!



//site_main
app.get('/', main_page.site_main_get);

app.post('/', (req, res) => {

    //site_main id, pw 입력값.
    var { userId, userPw } = req.body;
    var login_info = [userId, userPw];


    //sql에 idpw 있는지 검사
    db.query('SELECT * FROM member WHERE ID = ? and PW = ?;', login_info, function (err, rows, fields) {
        if (err) throw console.log(err);

        for (var i = 0; i <= rows.length; i++)
            console.log("db에 존재하는 열: \n" + rows[i]);

        console.log(rows);
        console.log(fields);

        //id pw 틀리면 login 실패
        if (rows.length == 0) {
            res.render("site_main", { vaildMember: 0 });

        } else {
            //login 성공.
            res.render("site_main");
        }

    });



});


//site_signup
app.get('/signup', signup_page.site_signup_get);



app.post('/signup', (req, res) => {     // 참고: 라우트 응답객체 (res) 는 어떤 분기에도 존재해야 하며, 한 분기에 하나만 존재해야 함!! (send와 redirect 같이 사용 불가.)

    var { userName, userId, userPw } = req.body;
    var inputDatas = [userName, userId, userPw];

    
    //sql에 id가 있는지 검사.
    db.query('SELECT * FROM member WHERE ID = ?;', userId, function (err, rows, fields) {
        if (err) throw console.log(err);

        for (var i = 0; i < rows.length; i++)
            console.log("db에 존재하는 열: \n" + rows[i]);


        if (rows.length == 0) {
            //id 다르면 db에 쓰고 홈 리다이렉트 및 alert
            res.render("site_main", {idMatch : 0});

            //res.send("<form action='/signup' method='get' name='redirect_signup'> <button type='submit' name='submit'> 회원가입 완료 </button> </form>");
            

            db.query('INSERT INTO member (number, Name, ID, PW) VALUES (null, ?, ?, ?);', inputDatas, function (err, rows, fields) {
                if (err) throw console.log(err);

                console.log('********mysql에 입력 완료*******\n' + inputDatas);
            });


        } else {
            //id 같으면 alert
            res.render("site_signup", {idMatch : 1});


            /* 참고: send 대신 render 사용하면 redirect와 동시에 html로 data 전달 가능.
            res.send("<form action='/signup' method='get' name='redirect_signup'> </form> <script>alert('이미존재하는 아이디입니다');</script>");*/
        }

    });

});



app.listen(process.env.SERVER_PORT, function() {
    console.log('express server running on port ' +  process.env.SERVER_PORT);
});