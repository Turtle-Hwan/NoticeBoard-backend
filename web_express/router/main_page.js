//modules



//GET
exports.site_main_get = function(req, res, next) {

    res.render("site_main", {});


    /*  express 덕에 생략가능.
    fs.readFile('./web_express/front/site_main.html', function(err, data) {
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



