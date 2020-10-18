var fs = require('fs');
var http = require('http');
var qs = require('querystring');

var sql = require('./mysql.js');


http.createServer(function(req, res) {					//http 서버 생성.

	var readHtml = "web/site.html";
	fs.readFile(readHtml, "utf8", function(err, data) {	//web/index.html를 읽어와서 data에 저장.	
		if(err) {
			console.log(err);
		} else {
			console.log("******" + readHtml + "읽음*********\n");

			res.writeHead(200, {'Content-Type' : 'text/html'});	//연결되면 end("내용")에서 내용이 html 형식으로 전달됨.
			res.end(data);
		}
	});


	
	//html form 에서 post로 보낸 데이터 받기
	if(req.method == 'POST') {
		var body = '';			//너무 많은 데이터가 들어와도 받을 수 있도록

		req.on('data', function(data) {
			body += data;
		});


		var postData = null;
		req.on('end', function() {
			postData = qs.parse(body);

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

	}


}).listen(3000, function() {	//포트 3000
	console.log('Server is running at http://localhost:3000/\n');
});








