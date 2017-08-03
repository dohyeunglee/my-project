//var mongoose = require('mongoose');
var mysql = require('mysql');

// database 객체에 db, schema, model 모두 추가
var database = {};

// 초기화를 위해 호출하는 함수
database.init = function (app, config) {
    console.log('init() 호출됨.');

    createPool(config);
    load(app, config);
}

//데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function createPool(config) {
    console.log('createPool(config) 호출됨.');

    var pool = mysql.createPool({
        connectionLimit: config.pool.connectionLimit,
        host: config.pool.host,
        user: config.pool.user,
        password: config.pool.password,
        database: config.pool.database,
        debug: config.pool.debug
    });

    pool.execute = execute;
    pool.checkGetConnectionError = checkGetConnectionError;
    pool.executeSql = executeSql;
    pool.checkSqlError = checkSqlError;

    database.pool = pool;

}

function execute(pool, sql, data, callback) {
    pool.getConnection(function (err, conn) {
        if(!pool.checkGetConnectionError(err, conn, callback)){
            return false;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
        
        var result = pool.executeSql(conn, sql, data, callback);
        return result;
    });
}

function checkGetConnectionError(err, conn, callback){
    if(err){
        if(conn){
            conn.release();
        }
        callback(err, null);
        return false;
    }
    else{
        return true;
    }
}

function executeSql(conn, sql, data, callback){
    var exec = conn.query(sql, data, function(err, result){
        conn.release();
        console.log('실행 대상 SQL: ' + exec.sql);
        
        if(!checkSqlError(err, callback)){
            return false;
        }
        callback(null, result);
        return true;
    });
}

function checkSqlError(err, callback){
    if(err){
        console.log('SQL 실행 시 에러 발생함');
        console.dir(err);
        callback(err, null);
        return false;
    }
    else{
        return true;
    }
}

function load(app, config){
    var sqls = require('./sql');
    var len = sqls.length;
    console.dir(sqls);
    console.log(len);
    for(var i = 0 ; i < len ; i++){
        database[sqls[i].name] = sqls[i].method;
        console.log('데이터베이스에 ' + sqls[i].name + '속성이 추가');
    }
    app.set('database', database);
    console.log('database 객체가 app 객체의 속성으로 추가됨');
}

// database 객체를 module.exports에 할당
module.exports = database;
