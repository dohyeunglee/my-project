var sql = [];

var sentence = {
    insertUser: 'INSERT INTO users set ?',
    findAll: 'SELECT * FROM products',
    findProduct: 'SELECT * FROM products WHERE id = ?',
    findById: 'SELECT * FROM users WHERE id = ? and password = ?',
    insertCartDetail: 'INSERT INTO cartdetail VALUES (?, ?, ?, ?, ?)',
    insertCartOption: 'INSERT INTO cartoption VALUES (?, ? ,?, ?)',
    insertBuyDetail: 'INSERT INTO buydetail VALUES (?, ?, ?, ?, ?)',
    insertBuyOption: 'INSERT INTO buyoption VALUES (?, ?, ?, ?)',
    findCartDetail: 'SELECT * FROM cart NATURAL JOIN cartdetail NATURAL JOIN colorsize',
    findCartOption: 'SELECT * FROM cart NATURAL JOIN cartoption NATURAL JOIN options',
    findBuyDetail: 'SELECT * FROM buy NATURAL JOIN buydetail NATURAL JOIN colorsize',
    findBuyOption: 'SELECT * FROM buy NATURAL JOIN buyoption NATURAL JOIN options',
    addUser: 'INSERT INTO users VALUES (?, ?)',
    duplicateId: 'SELECT * FROM users WHERE id = ?',
    deleteCart: 'DELETE FROM cart WHERE user_id = ? and cart_id = ?',
    updateTotalNumber: 'UPDATE products SET number = number - ? WHERE id = ?',
    updateDetailNumber: 'UPDATE colorsize SET number = number - ? WHERE product_id = ? and color = ? and size = ?',
    updateOptionNumber: 'UPDATE options SET number = number - ? WHERE product_id = ? and options = ?',
    findSelect: 'SELECT color, size, number FROM colorsize WHERE product_id = ?',
    findOption: 'SELECT options, price, number FROM options WHERE product_id = ?',
    insertBuy: 'INSERT INTO buy (user_id) VALUES (?)',
    insertCart: 'INSERT INTO cart (user_id) VALUES (?)'
};
var updateDetailNumber = function(pool, data, callback){
    console.log('updateDetailNumber 호출됨');
    console.log(data);

    pool.execute(pool, sentence.updateDetailNumber, data, callback);
};

var updateOptionNumber = function(pool, data, callback){
    console.log('updateOptionNumber 호출됨');
    console.log(data);

    pool.execute(pool, sentence.updateOptionNumber, data, callback);
};

var findProduct = function(pool, data, callback){
    console.log('insertCart 호출됨');
    console.log(data);

    pool.execute(pool, sentence.findProduct, data, callback);
}
var insertCart = function(pool, data, callback){
    console.log('insertCart 호출됨');
    console.log(data);

    pool.execute(pool, sentence.insertCart, data, callback);
};

var maxCartId = function(pool, data, callback){
    console.log('maxCartId 호출됨');
    console.log(data);

    pool.execute(pool, sentence.maxCartId, data, callback);
};
var insertUser = function (pool, data, callback) {
    console.log('insertUser 호출됨');
    console.log(data);

    pool.execute(pool, sentence.insertUser, data, callback);
};

var findAll = function(pool, data, callback){
    console.log('findAll 호출됨');
    console.log(data);
    
    pool.execute(pool, sentence.findAll, data, callback);
};

var findById = function(pool, data, callback){
    console.log('findById 호출됨');
    console.log(data);
    
    pool.execute(pool, sentence.findById, data, callback);
};

var insertCartDetail = function(pool, data, callback){
    console.log('insertCartDetail 호출됨');
    console.log(data);

    pool.execute(pool, sentence.insertCartDetail, data, callback);
};

var insertCartOption = function(pool, data, callback){
    console.log('insertCartOption 호출됨');
    console.log(data);

    pool.execute(pool, sentence.insertCartOption, data, callback);
};


var insertBuyOption= function(pool, data, callback){
    console.log('insertBuyOption 호출됨');
    console.log(data);

    pool.execute(pool, sentence.insertBuyOption, data, callback);
};

var insertBuyDetail = function(pool, data, callback){
    console.log('insertBuyDetail 호출됨');
    console.log(data);

    pool.execute(pool, sentence.insertBuyDetail, data, callback);
};

var findCartDetail = function(pool, data, callback){
    console.log('findCartSelect 호출됨');
    console.log(data);

    pool.execute(pool, sentence.findCartDetail, data, callback);
};

var findCartOption = function(pool, data, callback){
    console.log('findCartOption 호출됨');
    console.log(data);

    pool.execute(pool, sentence.findCartOption, data, callback);
};

var findBuyDetail = function(pool, data, callback){
    console.log('findBuyDetail 호출됨');
    console.log(data);

    pool.execute(pool, sentence.findBuyDetail, data, callback);
};

var findBuyOption= function(pool, data, callback){
    console.log('findBuyOption 호출됨');
    console.log(data);

    pool.execute(pool, sentence.findBuyOption, data, callback);
};
var addUser = function(pool, data, callback){
    console.log('addUser 호출됨');
    console.log('addUser Data: ', data);

    pool.execute(pool, sentence.addUser, data, callback);
};

var duplicateId = function(pool, data, callback){
    console.log('duplicateId 호출됨');
    console.log(data);

    pool.execute(pool, sentence.duplicateId, data, callback);
};

var duplicateCart = function(pool, data, callback){
    console.log('duplicateCart 호출됨');
    console.log(data);

    pool.execute(pool, sentence.duplicateCart, data, callback);
};

var deleteCart = function(pool, data, callback){
    console.log('deleteCart 호출됨');
    console.log(data);

    pool.execute(pool, sentence.deleteCart, data, callback);
};

var insertBuy = function(pool, data, callback){
    console.log('insertBuy 호출됨');
    console.log(data);

    pool.execute(pool, sentence.insertBuy, data, callback);
};

var updateTotalNumber = function(pool, data, callback){
    console.log('updateTotalNumber 호출됨');
    console.log(data);

    pool.execute(pool, sentence.updateTotalNumber, data, callback);
}

var findOption = function(pool, data, callback){
    console.log('findOption 호출됨');
    console.log(data);

    pool.execute(pool, sentence.findOption, data, callback);
}

var findSelect = function(pool, data, callback){
    console.log('findSelect 호출됨');
    console.log(data);

    pool.execute(pool, sentence.findSelect, data, callback);
}


sql.push({name: 'insertUser', method: insertUser});
sql.push({name: 'findAll', method: findAll});
sql.push({name: 'findById', method: findById});
sql.push({name: 'insertCartDetail', method: insertCartDetail});
sql.push({name: 'insertCartOption', method: insertCartOption});
sql.push({name: 'insertBuyDetail', method: insertBuyDetail});
sql.push({name: 'insertBuyOption', method: insertBuyOption});
sql.push({name: 'findCartDetail', method: findCartDetail});
sql.push({name: 'findCartOption', method: findCartOption});
sql.push({name: 'findBuyDetail', method: findBuyDetail});
sql.push({name: 'findBuyOption', method: findBuyOption});
sql.push({name: 'addUser', method: addUser});
sql.push({name: 'duplicateId', method: duplicateId});
sql.push({name: 'duplicateCart', method: duplicateCart});
sql.push({name: 'deleteCart', method: deleteCart});
sql.push({name: 'insertBuy', method: insertBuy});
sql.push({name: 'findOption', method: findOption});
sql.push({name: 'findSelect', method: findSelect});
sql.push({name: 'maxCartId', method: maxCartId});
sql.push({name: 'insertCart', method: insertCart});
sql.push({name: 'findProduct', method: findProduct});
sql.push({name: 'updateTotalNumber', method: updateTotalNumber});
sql.push({name: 'updateDetailNumber', method: updateDetailNumber});
sql.push({name: 'updateOptionNumber', method: updateOptionNumber});
module.exports = sql;
