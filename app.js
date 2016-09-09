var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var http = require('http');
var request = require('request');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 2); // format json responses for easier viewing

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));


var apiPath;
var contents;

var testName = new Array();
var testId = new Array();
var testcasesName = new Array();
var testcasesId = new Array();
var cycleName = new Array();
var cycleId = new Array();
var logName = new Array();
var logId = new Array();

function getFromAPI(path){
    var options = {
        'host': '192.168.130.90',
        'port': '8888',
        'path': path
    };
    callback = function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            var jsonString = str;
            contents = JSON.parse(jsonString);
        });
    }
    http.request(options, callback).end();
}



app.get('/tests',function(req, res){
    apiPath = '/api/tests'
    getFromAPI(apiPath);

    setTimeout(function(){
        for(var i =0; i<contents.length; i++){
            testName[i] = contents[i].name;
            testId[i] = contents[i].id;
        }
        res.render('tests',{times:contents.length ,testId:testId, testName:testName});
    },1000);
});

app.get('/tests/:id/testcases',function(req, res){
    apiPath = '/api/tests/'+req.params.id+'/testcases';
    getFromAPI(apiPath);

    setTimeout(function(){
        for(var i =0; i<contents.length; i++){
            testcasesName[i] = contents[i].name;
            testcasesId[i] = contents[i].id;
        }
        res.render('testcases',
            {times:contents.length ,
                testcasesId:testcasesId, 
                testcasesName:testcasesName,
                testId:req.params.id
            });
    },1000);
});


app.get('/tests/:testId/testcases/:testcaseId/cycles',function(req, res){
    apiPath = '/api/testcases/'+req.params.testcaseId+'/cycles';
    getFromAPI(apiPath);

    setTimeout(function(){
        for(var i =0; i<contents.length; i++){
            cycleName[i] = contents[i].cycle;
            cycleId[i] = contents[i].id;
        }
        res.render('cycles',
            {times:contents.length ,
                testId:req.params.testId,
                testcaseId:req.params.testcaseId,
                cycleName:cycleName,
                cycleId:cycleId
            });
    },1000);
});


app.get('/tests/:testId/testcases/:testcaseId/cycles/:cycleId/logs',function(req, res){
    apiPath = '/api/cycles/'+req.params.cycleId+'/logs';
    getFromAPI(apiPath);

    setTimeout(function(){
        for(var i =0; i<contents.length; i++){
            logName[i] = contents[i].filename;
            logId[i] = contents[i].id;
        }
        res.render('logs',
            {times:contents.length ,
                testId:req.params.testId,
                testcaseId:req.params.testcaseId,
                cycleId:req.params.cycleId,
                logName:logName,
                logId:logId
            });
    },1000);
});


app.get('/tests/:testId/testcases/:testcaseId/logs',function(req, res){
    apiPath = '/api/testcases/'+req.params.testcaseId+'/logs';
    getFromAPI(apiPath);

    setTimeout(function(){
        for(var i =0; i<contents.length; i++){
            logName[i] = contents[i].filename;
            logId[i] = contents[i].id;
        }
        res.render('logs',
            {times:contents.length ,
                testId:req.params.testId,
                logName:logName,
                logId:logId
            });
    },1000);
});

app.get('/tests/:testId/logs',function(req, res){
    apiPath = '/api/cycles/'+req.params.cycleId+'/logs';
    getFromAPI(apiPath);

    setTimeout(function(){
        for(var i =0; i<contents.length; i++){
            logName[i] = contents[i].filename;
            logId[i] = contents[i].id;
        }
        res.render('logs',
            {times:contents.length ,
                testId:req.params.testId,
                testcaseId:req.params.testcaseId,
                cycleId:req.params.cycleId,
                logName:logName,
                logId:logId
            });
    },1000);
});

function delete_path(path){
    request({
          uri: path,
          method: "DELETE",
          timeout: 10000,
          followRedirect: true,
          maxRedirects: 10
    }, function(error, response, body) {
    });
}

app.get('/tests/:id/delete',function(req,res){
    //delete tests
    var test_path = "http://192.168.130.90:8888/api/tests/"+req.params.id;
    delete_path(test_path);
    //delete tests-detabase(container)
    var data_path = "http://192.168.130.90:8080/api/containers/"+req.params.id;
    delete_path(data_path);
    res.end("you have deleted the tests");
})

app.get('/tests/:testId/testcases/:testcaseId/delete',function(req,res){
    //delete tests-testcases
    var testcase_path = "http://192.168.130.90:8888/api/tests/"+req.params.testId+"/testcases/"+req.params.testcaseId;
    delete_path(testcase_path);
    //delete testcases-cycles
    var testcase_path = "http://192.168.130.90:8888/api/tests/"+req.params.testId+"/testcases/"+req.params.testcaseId+"/cycles";
    delete_path(testcase_path);
    res.end("you have deleted the testcase");
})

app.get('/tests/:testId/testcases/:testcaseId/cycles/:cycleId/delete',function(req,res){
    //delete testcases-cycles
    var cycle_path = "http://192.168.130.90:8888/api/testcases/"+req.params.testcaseId+"/cycles/"+req.params.cycleId;
    delete_path(cycle_path);
    //delete cycles-logs
    var cycle_path = "http://192.168.130.90:8888/api/testcases/"+req.params.testcaseId+"/cycles/"+req.params.cycleId+"/logs";
    delete_path(cycle_path);
    res.end("you have deleted the cycle");
})

/*
app.get('/tests/:testId/testcases/:testcaseId/cycles/:cycleId/logs/:logId/delete',function(req,res){
    //delete cycles-logs
    var log_path = "http://192.168.130.90:8888/api/cycles/"+req.params.cycleId+"/logs/"+req.params.logId;
    delete_path(log_path);

    //delete testcases-logs
    var log_path2 = "http://192.168.130.90:8888/api/testcases/"+req.params.testcaseId+"/logs/"+req.params.logId;
    console.log(log_path2);
    delete_path(log_path2);
    console.log("I have deleted the testcases-logs");

    //delete tests-logs
    var log_path3 = "http://192.168.130.90:8888/api/tests/"+req.params.testId+"/logs/"+req.params.logId;
    delete_path(log_path3);
    res.end();

    //delete logs-database(container/file)
    //need to get the name of log from logId
    apiPath = '/api/cycles/'+req.params.cycleId+'/logs/'+req.params.logId;
    getFromAPI(apiPath);
    setTimeout(function(){
        var tmp_name = contents.filename;
        var log_path = "http://192.168.130.90:8000/api/containers/"+req.params.testId+"/files/"+req.params.tmp_name;
        delete_path(log_path);

        res.end("you have deleted the cycle");
    },1000);
})
*/

app.get('/logs/delete',function(req,res){
    apiPath = '/api/logs';
    getFromAPI(apiPath);

    setTimeout(function(){
        for(var i =0; i<contents.length; i++){
            logId[i] = contents[i].id;
        }
        for(var i =0; i<contents.length; i++){
            var log_path = "http://192.168.130.90:8888/api/logs/"+logId[i];
            request({
                uri: log_path,
                method: "DELETE",
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            }, function(error, response, body) {
            });
        }
        res.end("all deleted");
    },1000);
})

app.listen(3000, function () {
  console.log('Website demo listening on port 3000');
});

module.exports = app;
