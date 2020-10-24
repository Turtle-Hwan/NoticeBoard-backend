//modules




//GET
exports.site_signup_get = function(req, res, next) { 

    res.render("site_signup", {});

    /*
    fs.readFile('./web_express/front/site_signup.html', function(err, data) {
        if(err) {
            console.log(err);
        } else {
            res.writeHead(200, {'Content-Type' : 'text/html'});
			res.end(data);
        }
    });
    */
}


//POST
exports.site_signup_post = function (err, req, res, next) {

    res.send("<form action='/' method='get' name='redirect_signup'> <button type='submit' name='submit'> 회원가입 완료 </button> </form>");


    var postdata = qs.parse(body);
    console.log(postdata);


    var { inputName, inputId, inputPw } = req.body;
    var member_IDPW = [inputName, inputId, inputPw];

    console.log(member_IDPW);

    //sql
    var existId = [];
    existId = 'SELECT * FROM member WHERE ID =' + inputId;
    if (existId.length == 0) {


        sql.db.query('INSERT INTO member (number, Name, ID, PW) VALUES (null, ?, ?, ?);', inputData, function (err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                console.log('********mysql에 입력 완료*******\n' + rows);
            }
        });
    } else {
        res.send('<script type ="text/javascript">alert("존재하는 아이디입니다");</script>');
    }


}






