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
exports.site_signup_post = function(err, req, res, next) {
    res.render('site_main', {inputName: inputName, inputId: inputId, inputPw: inputPw});
    var {inputName, inputId, inputPw} = req.body;

    var member_IDPW = [inputName, inputId, inputPw];

    res.json('123');



    console.log(member_IDPW);

}






