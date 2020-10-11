var fs = require("fs");
var server = require('http');


fs.writeFile("inputData.txt", "inputinputinput", "utf8", function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log("inputDate 쓰기 완료\n")
	}
})

fs.readFile("inputData.txt", "utf8", function(err, data) {
	if(err) {
		console.log(err);
	} else {
		console.log("inputData 읽음\n" + data);
	}
});



server.createServer(function(req, res) {
	res.writeHead(200, { 
    	'Content-Type' : 'text/html' 
  	});
	fs.createReadStream("./site.html", {encoding:'utf8'}).pipe(res);
	
}).listen(3000);

console.log('Server is running at goorm.io');


