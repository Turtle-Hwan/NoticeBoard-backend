
exports.MysqlDateFormat = function(date) {
    let year = date.getFullYear();

    let month = 1 + date.getMonth();
    month = month >= 10 ? month : '0' + month;

    let day = date.getDate();
    day = day >= 10 ? day : '0' + day;

    let hh = date.getHours();
    hh = hh >= 10 ? hh : '0' + hh;

    let mm = date.getMinutes();
    mm = mm >= 10 ? mm : '0' + mm;

    let ss = date.getSeconds();
    ss = ss >= 10 ? ss : '0' + ss;

    
    return year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss;
}