const sql = require('mysql');
const express = require('express');
const app = express();

//express built-in body-parser
app.use(express.json());             
app.use(express.urlencoded( {extended:false} ))

//dotenv
require('dotenv').config();
app.set('port', (process.env.SERVER_PORT));

//굳이 html을 쓰기 위해...
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/front');

//router 각각 분리
const main_page = require('./router/main_page');
const signup_page = require('./router/signup_page');

//db 연결
const db_login = require('./database/db_login');

const db = sql.createConnection(db_login.db_info);
db.connect();   //각각의 app. 콜백마다 connect 해주면 중복 일어남!!



//
//cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//session 인증 위해 cookieparser 필요
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
//mysql session에 연결
app.use(session({
    key : 'login-key',
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : true,
    store : new mysqlStore(db_login.db_info),
    cookie : {
        maxAge : 1000 * 60 * 60 //쿠키 유효시간 1시간
    }
}))


//
//bcrypt 보안
const bcrypt = require('bcrypt');
const salt = 10;


//passport 미들웨어는 session 후에 장착해야 함.
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;   //어떤 로그인 방식을 취하냐: Strategy
//passport 미들웨어 장착.
app.use(passport.initialize());
app.use(passport.session());


//serializeUser : passport 가 session에 사용자 id 저장하도록 해줌.
passport.serializeUser(function(user, done) {
    console.log('id 전달\nserialize \n' + user.id);
    done(null, user.id);
});

//로그인 성공 후 페이지 방문 시 마다 호출. id를 기준으로 db에서 데이터 검색.
passport.deserializeUser(function(id, done) {
    console.log('deserialize' + id);
    done(null, id);
});

//connect-flash
const flash = require('connect-flash');
app.use(flash());



//passport 사용해서 post 정보 받고, 로그인.
app.post('/', passport.authenticate('local', {
    successRedirect : '/main',
    failureRedirect : '/',
    failureFlash : '인증 실패',
    successFlash : '인증 성공'
    })
);

passport.use(new LocalStrategy({
    usernameField : 'inputId',
    passwordField : 'inputPw',
    passReqToCallback : true
    },
    function(req, inputId, inputPw, done){     //done 은 인증 성공 시 passport에게 사용자 정보 전달함.
        db.query('SELECT * FROM member WHERE ID = ? and PW = ?;', [inputId, inputPw], function (err, rows, fields) {
            if (err) return done(err);

            //id pw 틀리면 login 실패
            if (rows.length == 0) {
                return done(null, false, {message: '로그인 실패'});

            } else {
                //login 성공.
                return done(null, {message: '로그인 성공'});
            }
        });
    })
);




//  login with passport and compare hash of bcrypt
app.get('/', main_page.site_main_get);











//  signup with passport & hashing with bcrypt /회원가입
app.post('/signup', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true,
    successFlash: '회원가입 성공'
}));

passport.use('local', new LocalStrategy({
        //body 필드에서 값 받아옴.
        usernameField: 'userName', 
        passwordField: 'userPw',
        session: true,
        passReqToCallback: true
    },
    function(req, username, password, done) {

        db.query('SELECT * FROM member WHERE ID = ?;', [username], function (err, rows) {
            if (err) return done(err);

            if (rows.length != 0) {
                if (err) throw err;
                return done(null, false, {message: 'id 중복'});
            } else {
                //비번 해싱.
                bcrypt.hash(password, salt, function(err, hash) {
                    userId = req.body.userId;
                    var sql = [username, userId, hash];

                    db.query('INSERT INTO member(number, Name, ID, PW) VALUES (null, ?, ?, ?)', sql, function (err, rows) {
                        if (err) throw err;
                        return done(null, {'id' : username, 'pw' : password });
                    });
                });
            }
        })
    }
));





/*  <<<login without passport, bcrypt>>>
//site_main
app.get('/', main_page.site_main_get);


app.post('/', (req, res) => {

    //site_main id, pw 입력값.

    //sql에 idpw 있는지 검사
    db.query('SELECT * FROM member WHERE ID = ? and PW = ?;', [req.body.inputId, req.body.inputPw], function (err, rows, fields) {
        if (err) throw console.log(err);

        //id pw 틀리면 login 실패
        if (rows.length == 0) {
            res.render("site_main", { vaildMember : 0 });

        } else {
            //login 성공.
            res.render("site_main_login");
        }
    });
});
*/



//site_signup
app.get('/signup', signup_page.site_signup_get);




/*  <<<signup without passport, bcrypt>>>
app.post('/signup', (req, res) => {     // 참고: 라우트 응답객체 (res) 는 분기마다 존재해야 하며, 한 분기에 하나만 존재해야 함!! (send와 redirect 같이 사용 불가.)

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
            res.send("<form action='/signup' method='get' name='redirect_signup'> </form> <script>alert('이미존재하는 아이디입니다');</script>");
            */

        /*
        }

    });

}); */






//site_main_login
app.get('/main', (req, res) => {
    res.render('site_main_login');
});

//main 페이지 글쓰기, 파일 올리기
app.post('/main', (req, res) => {

})

//logout page with passport
app.get('/logout', (req, res) => {
    req.logout();
    req.session.save(function() {   //sessionStore에 데이터 반영 후 redirect => 로그인할 때도 세션 문제 겪으면 같은 처리.
        res.redirect('/');
    })
})






app.listen(process.env.SERVER_PORT, function() {
    console.log('express server running on port ' +  process.env.SERVER_PORT);
});