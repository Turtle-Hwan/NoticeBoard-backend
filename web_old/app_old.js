




//<<<login without passport, bcrypt>>>
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



//<<<signup without passport, bcrypt>>>
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

        }

    });

});