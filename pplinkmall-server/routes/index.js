var express = require('express');
var async = require('async');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('before set session');
    console.dir(req.session);
    req.session.name = 'dh';
    console.log('after set session');
    console.dir(req.session);
    res.render('index');
});

router.get('/process/session', function(req, res, next) {
   console.log('세션 받아오기');

   var sess = req.session;
   console.log('session: ', sess);
   if(!sess.user_id){
       res.json({type: 'NO_SESSION'});
   }
   else{
       console.log('로그인 되어 있는 유저: ', sess.user_id);
       res.json({type: 'SESSION_EXIST', detail: sess.user_id});
   }
});

router.post('/process/logout', function(req, res, next){
    console.log('로그 아웃 하기');

    var sess = req.session;
    console.log('body :' + req.body);
    console.log('session: ', sess);

    if(sess.user_id){
        req.session.destroy(function(err){
            if(err){
                console.log('세션 유저 정보 지우는 중 에러 발생');
            }
            else{
                res.json({type:'LOGOUT_SUCCESS'});
                console.log('세션 유저 정보 지우기 성공');
            }
        })
    }
    else{
        console.log('로그인이 되어 있지 않은 유저가 로그 아웃 요청');
        res.json({type: 'LOGOUT_FAIL', detail: 'NOT_LOGGED_IN'});
    }

});
router.get('/process/products',function(req,res,next){
    console.log('상품 정보 불러오기');

    var database = req.app.get('database');
    console.dir(req)
    if(database.pool){
        database.findAll(database.pool, null, function(err, results){
            if(err){
                console.error('상품 리스트 조회 중 에러 발생 : ' + err.stack);
            }
            if(results){
                console.dir(results);
                res.json(results);
            }
            else{
                console.error('상품 정보가 존재하지 않음');
            }
        })
    }
    else{
        console.error('Database Error: ' + err.stack);
    }

});

router.get('/process/product',function(req,res,next){
    console.log('상품 한 개 정보 불러오기');

    var database = req.app.get('database');
    var id = Number(req.query.id);

    if(database.pool){
        database.findProduct(database.pool, id , function(err, results){
            if(err){
                console.error('Product 조회 중 에러 발생: ' + err.stack);
            }
            if(results){
                console.dir(results);
                res.json(results);
            }
            else{
                console.error('Product 정보가 존재하지 않음');
            }
        })
    }
    else{
        console.error('Database Error: ' + err.stack);
    }

});
router.get('/process/option',function(req,res,next){
    console.log('옵션 정보 불러오기');

    var database = req.app.get('database');
    var id = Number(req.query.id);

    if(database.pool){
        database.findOption(database.pool, id , function(err, results){
            if(err){
                console.error('option 조회 중 에러 발생: ' + err.stack);
            }
            if(results){
                console.dir(results);
                res.json(results);
            }
            else{
                console.error('option 정보가 존재하지 않음');
            }
        })
    }
    else{
        console.error('Database Error: ' + err.stack);
    }

});


router.get('/process/select',function(req,res,next){
    console.log('select 정보 불러오기');

    var database = req.app.get('database');
    var id = Number(req.query.id);

    if(database.pool){
        database.findSelect(database.pool, id , function(err, results){
            if(err){
                console.error('select 조회 중 에러 발생: ' + err.stack);
            }
            if(results){
                console.dir(results);
                res.json(results);
            }
            else{
                console.error('select 정보가 존재하지 않음');
            }
        })
    }
    else{
        console.error('Database Error: ' + err.stack);
    }

});

router.post('/process/register', function(req, res, next){
   console.log('회원가입 요청');

   var paramId = req.body.id;
   var paramPassword = req.body.pwd;

   console.log('요청 파라미터: ' + paramId + ', ' + paramPassword);

   var database = req.app.get('database');

   if(database.pool){
           addUser(database, paramId, paramPassword, function(err, addedUser){
               if(err){
                   console.error('사용자 추가 중 에러 발생: ' + err.stack);
                   res.json({type: FAIL, detail: err.stack});
               }
               if(addedUser){
                   console.log('addedUser: ',addedUser);
                   console.log('사용자 추가 성공');
                   res.json({type: 'SUCCESS'});
               }
               else{
                   res.json({type: 'FAIL', detail: 'unknown error'});
               }
           });
    }
   else{
       console.log('디비 에러');
       res.json({type: 'FAIL', detail: 'DB ERROR'});
   }
});

router.post('/process/id_check', function(req, res){
    console.log('아이디 중복 체크');
    let paramId = req.body.id;
    console.log('paramId: ', paramId);
    let database = req.app.get('database');

    if(!database.pool){
        console.log('db error');
        res.json({type: 'FAIL'});
    }
    else{
        duplicateId(database, paramId, function(err, results){
            if(err){
                console.log('err');
            }
            if(results[0]){
                console.log('중복');
                res.json({type: 'DUPLICATE'});
            }
            else{
                console.log('중복 없음');
                res.json({type: 'SUCCESS'});
            }

        })
    }

});

router.get('/process/carts',function(req,res,next){
    console.log('장바구니 정보 불러오기');
    var send = {};
    var paramId = req.session.user_id;
    console.log('유저 아이디: ', paramId);

    var database = req.app.get('database');

    if(database.pool){
        async.parallel([
            function(callback) {
                database.findCartDetail(database.pool, paramId, function (err, results) {
                    if (err) {
                        console.error('디테일 장바구니 리스트 조회 중 에러 발생 : ' + err.stack);
                        callback(err);
                    }
                    if (results) {
                        console.dir(results);
                        send.select = results;
                        callback();
                    }
                    else {
                        console.error('디테일 장바구니가 존재하지 않음');
                        callback(err);
                    }
                })
            },
            function(callback){
                database.findCartOption(database.pool, paramId, function (err, results) {
                    if (err) {
                        console.error('옵션 장바구니 리스트 조회 중 에러 발생 : ' + err.stack);
                        callback(err);
                    }
                    if (results) {
                        console.dir(results);
                        send.option = results;
                        callback();
                    }
                    else {
                        console.error('옵션 장바구니가 존재하지 않음');
                        callback(err);
                    }
                })
            }],
            function(err){
                if(err){
                    console.log('실패');
                    res.json({type:'FAIL'})
                }
                else{
                    console.log('성공: ', send);
                    res.json({type:'SUCCESS', data: send});
                }
            })
    }
    else{
        console.error('Database Error: ' + err.stack);
    }

});

router.post('/process/insert_cart', function(req, res){
    console.log('장바구니 추가 시작');

    var paramId = req.session.user_id;
    var paramProduct = req.body.id;
    var options = req.body.option;
    var select = req.body.select;
    console.log('fucking: ', options, select);
    var database = req.app.get('database');
    if(!database.pool){
        console.log('Database Error');
    }
    var asyncTask = [];
    asyncTask.push(function(callback){
        database.insertCart(database.pool, paramId, function(err, results){
            if(err){
                console.log('error');
                callback(err);
            }
            if(results){
                console.log('results: ', results);
                callback(null, results.insertId);
            }
            else{
                console.log('장바구니 추가 실패');
                callback(err);
            }
        })

    })
    if(options[0]) {
        for (let i = 0; i < options.length; i++) {
            asyncTask.push(function(index, callback){
                console.log('1 index: ', index);
                database.insertCartOption(database.pool, [index, paramProduct, options[i].option, options[i].number], function(err, results){
                    if(err){
                        console.log('error');
                        callback(err);
                    }
                    if(results){
                        console.log('옵션 장바구니 추가 성공');
                        callback(null, index);
                    }
                    else{
                        console.log('옵션 장바구니 추가 실패');
                        callback(err);
                    }
                })
            })
        }
    }
    for (let i = 0 ; i <select.length; i++){
        asyncTask.push(function(index, callback){
            console.log('2 index: ', index);
            database.insertCartDetail(database.pool, [index, paramProduct, select[i].color, select[i].size, select[i].number], function(err, results){
                console.log('index: ', index);
                if(err){
                    console.log('error')
                    callback(err);
                }
                if(results){
                    console.log('디테일 장바구니 추가 성공');
                    callback(null, index);
                }
                else{
                    console.log('디테일 장바구니 추가 실패');
                    callback(err);
                }
            })
        })
    }
    async.waterfall(asyncTask, function(err){
        if(err) {
            res.json({type:'FAIL'});
            console.log('실패');
        }
        else{
            res.json({type:'SUCCESS'});
            console.log('성공');
        }
    });
});

router.post('/process/buy', function(req, res){
    console.log('구매 시작');

    var paramId = req.session.user_id;
    var paramProduct = req.body.id;
    var options = req.body.option;
    var select = req.body.select;
    console.log('fucking: ', options, select);
    var database = req.app.get('database');
    if(!database.pool){
        console.log('Database Error');
    }
    var asyncTask = [];
    asyncTask.push(function(callback){
        database.insertBuy(database.pool, paramId, function(err, results){
            if(err){
                console.log('error');
                callback(err);
            }
            if(results){
                console.log('results: ', results);
                callback(null, results.insertId);
            }
            else{
                console.log('구매 실패');
                callback(err);
            }
        })

    })
    if(options[0]) {
        for (let i = 0; i < options.length; i++) {
            asyncTask.push(function(index, callback){
                console.log('1 index: ', index);
                database.insertBuyOption(database.pool, [index, paramProduct, options[i].option, Number(options[i].number)], function(err, results){
                    if(err){
                        console.log('error');
                        callback(err);
                    }
                    if(results){
                        console.log('옵션 구매 성공');
                        database.updateOptionNumber(database.pool, [Number(options[i].number), paramProduct, options[i].option], function(err, results){
                            if(err){
                                console.log('err');
                                callback(err);
                            }
                            if(results){
                                console.log('옵션 개수 조정 성공');
                                callback(null, index);
                            }
                            else{
                                console.log('옵션 개수 조정 실패');
                                callback(err);
                            }
                        })
                    }
                    else{
                        console.log('옵션 구매 실패');
                        callback(err);
                    }
                })
            })
        }
    }
    for (let i = 0 ; i < select.length; i++){
        asyncTask.push(function(index, callback){
            console.log('2 index: ', index);
            database.insertBuyDetail(database.pool, [index, paramProduct, select[i].color, select[i].size, Number(select[i].number)], function(err, results){
                console.log('index: ', index);
                if(err){
                    console.log('error')
                    callback(err);
                }
                if(results){
                    console.log('디테일 구매 성공');
                    database.updateDetailNumber(database.pool, [Number(select[i].number), paramProduct, select[i].color, select[i].size], function(err, results){
                        if(err){
                            console.log('err');
                            callback(err);
                        }
                        if(results){
                            console.log('디테일 개수 조정 성공');
                            callback(null, index);
                        }
                        else{
                            console.log('디테일 개수 조정 실패');
                            callback(err);
                        }
                    })
                }
                else{
                    console.log('디테일 구매 실패');
                    callback(err);
                }
            })
        })
    }
    let totalNumber = 0 ;
    for(let i = 0 ; i < select.length ; i++){
        totalNumber += Number(select[i].number);
    }
    asyncTask.push(function(index, callback){
        database.updateTotalNumber(database.pool, [totalNumber, paramProduct], function(err, results){
            if(err){
                console.log('err');
                callback(err);
            }
            if(results){
                console.log('전체 개수 조정 성공');
                callback(null, index);
            }
            else{
                console.log('전체 개수 조정 실패');
                callback(err);
            }
        })
    })
    async.waterfall(asyncTask, function(err){
        if(err) {
            res.json({type:'FAIL'});
            console.log('실패');
        }
        else{
            res.json({type:'SUCCESS'});
            console.log('성공');
        }
    });
});

router.get('/process/recent', function(req, res){
   console.log('recent 시작');
   console.log('query: ', req.query);
   let id = req.query.id;
   let image = req.query.image;
   console.log(`id: ${id}, image: ${image}`);
   if(req.session.user_id){
       console.log('whose recent? : ', req.session.user_id);
       if(id && image) {
           if (!req.session.recents) {
               req.session.recents = [{id: id, image: image}];
           }
           else {
               req.session.recents.push({id: id, image: image});
               if (req.session.recents.length === 4) {
                   req.session.recents.shift();
               }
           }
           console.log('등록 요청');
           console.log('recents: ', req.session.recents);
           res.json({type:'SUCCESS'});
       }
       else{
           console.log('받기 요청: ', req.session.recents);
           res.json({type:'SUCCESS', data:req.session.recents});
       }
   }
   else{
       res.json({type: 'FAIL'});
   }
});
router.post('/process/login',function(req,res){
    console.log('login 시작');

    console.log('before set session');
    console.dir(req.session);

    console.dir(req.body);
    var paramId = req.body.id;
    var paramPwd = req.body.pwd;

    console.log("id: " + paramId + ", pwd: " + paramPwd);

    var database = req.app.get('database');

    if(database.pool){
        authUser(database, paramId, paramPwd, function(err, docs){
            if(err){
                console.error('Login Error: ' + err.stack);
                res.json({type:'FAIL',detail:'database_error'});
                return;
            }

            if(docs[0]){
                console.dir(docs);
                var user_id = docs[0].id;
                req.session.user_id = user_id;
                console.log('after set session');
                console.dir(req.session);

                res.json({type:'SUCCESS'});
            }
            else{
                res.json({type:'FAIL',detail:'no_id'});

            }
        })
    }
    else{
        console.error('Login Error');
        res.json({type:'FAIL',detail:'database_error'});
    }

});

router.post('/process/delete_cart', function(req, res){
    console.log('deleteCart 시작');

    var paramId = req.session.user_id;
    console.log('id: ' + paramId);
    var carted = req.body.carted;
    var database = req.app.get('database');
    if(!database.pool){
        console.log('Database Error');
    }
    var deleted = [];
    for(var i = 0 ; i < carted.length ; i++){
        deleted.push([paramId, carted[i]]);
    }
    async.each(deleted, function(deleteProduct, callback){
        database.deleteCart(database.pool, [deleteProduct[0], deleteProduct[1]], function (err, results) {
            if (err) {
                console.log('error: ' + err.stack);
                callback(err);
            }
            if (results) {
                console.log('delete success: ' + results);
                callback();
            }
            else {
                console.log('delete fail');
                callback(err);
            }
        })

        },
        function(err){
            if(err) res.json({type: 'FAIL'});
            else res.json({type:'SUCCESS'});
        }
    )

});


router.post('/process/buy', function(req, res){
    console.log('buy 시작');
    var paramId = req.session.user_id;
    console.log('id: ' + paramId);
    var carted = req.body.carted;
    var database = req.app.get('database');
    if(!database.pool){
        console.log('Database Error');
    }
    var buy = [];
    for(var i = 0 ; i < carted.length ; i++){
        console.log('product id: ' + carted[i].product + ', product number : ' + carted[i].number);
        console.log(typeof carted[i].number);
        buy.push([paramId, carted[i].product, carted[i].number]);
    }
    async.each(buy, function(buyProduct, callback){
            database.buyProduct(database.pool, [buyProduct[0], buyProduct[1], buyProduct[2]], function (err, results) {
                if (err) {
                    console.log('error: ' + err.stack);
                    callback(err);
                }
                if (results) {
                    database.updateNumber(database.pool, [buyProduct[2], buyProduct[1]], function(err, results){
                        if(err){
                            console.log('error: ' + err.stack);
                            callback(err);
                        }
                        if(results){
                            console.log('update success');
                            callback();
                        }
                        else{
                            console.log('update fail');
                            callback(err);
                        }
                    })
                }
                else {
                    console.log('buy fail');
                    callback(err);
                }
            })
        },
        function(err){
            if(err) res.json({type: 'FAIL'});
            else res.json({type:'SUCCESS'});
        }
    )
});


var authUser = function(database, id, password, callback){
    console.log("authUser called");
    database.findById(database.pool, [id, password], callback);
};

var duplicateId = function(database, id, callback){
    console.log('duplicateId called');
    database.duplicateId(database.pool, id, callback);
};

var addUser = function(database, id, pwd, callback){
    console.log('addUser called');
    database.addUser(database.pool, [id, pwd], callback);
};

module.exports = router;
