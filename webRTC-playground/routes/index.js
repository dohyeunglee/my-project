var express = require('express');
var router = express.Router();
var roomIo = require('../io');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('fucking');
});

router.get('/rooms/:room_number', function(req, res, next){
  let room_number = req.params.room_number;
  let room_exist = false;
  console.log('Room ' + room_number + ' enter');
  let room_name;
  for(let i = 0 ; i < roomIo.roomInfo.length ; i++) {
    if(roomIo.roomInfo[i].id === Number(room_number)){
      room_exist = true;
      room_name = roomIo.roomInfo[i].name;
      break;
    }
  }
  if(room_exist) {
    res.render('room', {number: room_number, name: room_name})
  }
  else{
    res.render('notFound', {number: room_number})
  }
})

router.get('/rooms', function(req, res, next){
  console.log('rooms started');
  res.json(roomIo.roomInfo);
});


module.exports = router;
