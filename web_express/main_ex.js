var express = require('express');
var app = express()

var fs = require('fs');


app.set('port', (process.env.PORT || 3000));


app.get('/', function(req, res) {
    fs.readFile('./web_express/site_main.html', function(err, data) {
        if(err) {
            console.log(err);
        } else {
            res.writeHead(200, {'Content-Type' : 'text/html'});
			res.end(data);
        }
    });
});




app.get("/signup", function(req, res) { 
    fs.readFile('./web_express/site_signup.html', function(err, data) {
        if(err) {
            console.log(err);
        } else {
            res.writeHead(200, {'Content-Type' : 'text/html'});
			res.end(data);
        }
    });
});
   
app.post("/signup", function(req, res) {
    req.on('end', function() {
        var postData = qs.parse(body);

        var inputData = [postData.inputName, postData.inputId, postData.inputPw];

        console.log(postData);



        sql.db.query('INSERT INTO member (Name, ID, PW) VALUES (?, ?, ?);', inputData, function(err, rows, fields) {
            if(err) {
                console.log(err);
            } else {
                console.log('********mysql에 입력 완료*******\n' + rows);
            }
        });
    });
})


app.listen(3000, function() {
    console.log('express server running on port 3000!')
});