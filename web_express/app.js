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


//bcrypt 보안
const bcrypt = require('bcrypt');
const salt = 10;


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

//passport 미들웨어는 session 후에 장착해야 함.
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;   //Strategy : 어떤 로그인 방식을 취하냐
//passport 미들웨어 장착.
app.use(passport.initialize());
app.use(passport.session());


//serializeUser : passport 가 session에 사용자 id 저장하도록 해줌.
passport.serializeUser(function(user, done) {
    console.log('serialize, id session에 전달됨, id : ', user.id, ', user : ', user);
    done(null, user.id);
});

//로그인 성공 후 페이지 방문 시 마다 호출. id를 기준으로 db에서 데이터 검색.
passport.deserializeUser(function(id, done) {
    console.log('deserialize 호출됨, id : ', id);
    done(null, id);
});

//connect-flash
const flash = require('connect-flash');
app.use(flash());



//passport 사용해서 post 정보 받고, 로그인.
app.post('/', passport.authenticate('login-local', {
    successRedirect : '/main',
    failureRedirect : '/',
    failureFlash : '로그인 실패',
    successFlash : '로그인 성공'
    })
);

passport.use('login-local', new LocalStrategy({
    usernameField : 'userId',
    passwordField : 'userPw',
    session : true,
    passReqToCallback : true
    },
    function(req, userid, password, done){     //done 은 인증 성공 시 passport에게 사용자 정보 전달함.

        db.query('SELECT * FROM member WHERE ID = ?;', [userid], function (err, rows, fields) {
            if (err) return done(err);

            //id 틀리면 login 실패
            if (rows.length == 0) {
                console.log('로그인 실패 : 없는 아이디')

                return done(null, false, { message: '로그인 실패' });
            } else {    //hash 된 비번 비교
                bcrypt.compare(password, rows[0].PW, (err, res) => {
                    if (res) {
                        console.log('로그인 성공')

                        return done(null, { id: userid, message: '로그인 성공' });
                    } else {
                        return done(null, false, {message: '비밀번호 불일치'})
                    }
                })
            }
        });
    })
);


// put up a login page 
app.get('/', main_page.site_main_get);



//  signup with passport & hashing with bcrypt /회원가입
app.post('/signup', passport.authenticate('signup-local', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: '회원가입 실패',
    successFlash: '회원가입 성공'
}));

passport.use('signup-local', new LocalStrategy({
        //body 필드에서 값 받아옴.
        usernameField: 'userName', 
        passwordField: 'userPw',
        session: true,
        passReqToCallback: true
    },
    function(req, username, password, done) {
        userId = req.body.userId;

        db.query('SELECT * FROM member WHERE ID = ?;', [userId], function (err, rows) {
            if (err) return done(err);

            if (rows.length != 0) {
                if (err) throw err;
                
                console.log('회원가입 실패, id 중복')

                return done(null, false, {message: 'id 중복'});
            } else {
                //비번 해싱.
                bcrypt.hash(password, salt, null, function(err, hash) {
                    var sql = [username, userId, hash];

                    console.log('id 다름, 회원가입 성공/// : ', req.session)
                    
                    db.query('INSERT INTO member(number, Name, ID, PW) VALUES (null, ?, ?, ?)', sql, function (err, rows) {
                        if (err) throw err;
                        return done(null, {'id' : username, 'pw' : password });
                    });
                });
            }
        })
    }
));




//site_signup
app.get('/signup', signup_page.site_signup_get);







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
        console.log('로그아웃 됨.')
    })
})






app.listen(process.env.SERVER_PORT, function() {
    console.log('express server running on port ' +  process.env.SERVER_PORT);
});